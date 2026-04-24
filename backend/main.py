from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine
import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from datetime import datetime, UTC
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRAPPER_PATH = os.path.join(BASE_DIR, "middleware", "wrapper.py")


load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", 'http://127.0.0.1:8000/'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/jobs/", response_model=schemas.JobResponse, status_code=201)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):

    # 1. Create a new job instance
    db_job = models.Job(
        script=job.script,
        target_url=job.target_url,
        status="queued"
    )

    # 2. Add to DB and commit to get the job_id
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # 3. AUTO-TRIGGER THE WRAPPER
    # sys.executable ensures the subprocess uses the same .venv as your backend
    # subprocess.Popen is non-blocking, so the API returns while the browser runs
    try:
        subprocess.Popen(
            [sys.executable, WRAPPER_PATH, str(db_job.job_id)],
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        print(f"[*] Successfully launched Kintsugi Wrapper for Job {db_job.job_id}")
    except Exception as e:
        print(f"[!] Critical Error: Failed to launch wrapper: {e}")

    # 4. Return the job object to the frontend
    return db_job

@app.get("/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.job_id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

# get all jobs endpoint
@app.get("/jobs/", response_model=list[schemas.JobResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    return db.query(models.Job).all()

@app.patch("/jobs/{job_id}", response_model=schemas.JobResponse)
def update_status(job_id: int, status_update: schemas.StatusUpdate, db: Session = Depends(get_db)):
    old_job_status = db.query(models.Job).filter(models.Job.job_id == job_id).first()
    if not old_job_status:
        raise HTTPException(status_code=404, detail=f"{job_id} does not exists")
    
    old_job_status.status = status_update.status
    db.commit()
    db.refresh(old_job_status)
    return old_job_status


#endpoint for returning a Selector instance (a row) which has the intent and job_id as requested by middleware
@app.get("/selectors/", response_model=schemas.SelectorResponse)
def get_selector(intent: str, job_id: int, db: Session = Depends(get_db)):
    # Filter by both intent and job_id
    selector = db.query(models.Selectors).filter(
        models.Selectors.intent == intent, 
        models.Selectors.job_id == job_id
    ).first()

    if selector:
        return selector
    else:
        # Status code 404 for first-run scenarios
        raise HTTPException(
            status_code=404, 
            detail=f"Baseline for intent '{intent}' in job {job_id} not found."
        )