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
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRAPPER_PATH = os.path.join(BASE_DIR, "middleware", "wrapper.py")

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",   # ADD THIS
        "http://127.0.0.1:3001"    # ADD THIS
    ],
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

    strip_json = json.dumps(job.strip_config)

    # 3. AUTO-TRIGGER THE WRAPPER
    # sys.executable ensures the subprocess uses the same .venv as your backend
    # subprocess.Popen is non-blocking, so the API returns while the browser runs
    try:
        subprocess.Popen(
            [sys.executable, WRAPPER_PATH, str(db_job.job_id), strip_json],
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        print(f"[*] Successfully launched Kintsugi Wrapper for Job {db_job.job_id} with custom strips")
    except Exception as e:
        print(f"[!] Critical Error: Failed to launch wrapper: {e}")

    # 4. Return the job object to the frontend
    return db_job

@app.get("/jobs/{job_id}/", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.job_id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

# get all jobs endpoint
@app.get("/jobs/", response_model=list[schemas.JobResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    return db.query(models.Job).all()

@app.patch("/jobs/{job_id}/", response_model=schemas.JobResponse)
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
    # Find the MOST RECENT successful selector for this intent globally
    selector = db.query(models.Selectors).filter(
        models.Selectors.intent == intent
    ).order_by(models.Selectors.updated_at.desc()).first()

    if selector:
        return selector
    else:
        raise HTTPException(
            status_code=404, 
            detail=f"No historical baseline found for intent '{intent}'."
        )

@app.post("/selectors/", response_model=schemas.SelectorResponse, status_code=201)
def save_new_selector(selector: schemas.SelectorBase, db: Session = Depends(get_db)):
   
   #need two columns of the Selector table to uniquely indentify the row
    job_id = selector.job_id
    intent = selector.intent
    existing_selector = db.query(models.Selectors).filter(models.Selectors.job_id == job_id, models.Selectors.intent == intent).first()

    if existing_selector:
        #updating the already existing selector instance (basically the db row) so that it stores the lastest changes
        existing_selector.intent = selector.intent
        existing_selector.last_success_dom = selector.last_success_dom
        existing_selector.selector = selector.selector
        db.commit()
        db.refresh(existing_selector)
        return existing_selector
    else:
        #creating a new selector instance and saving the job_id, intent, selector, last_success_dom to the db (Selectors table)
        new_selector = models.Selectors(**selector.model_dump())
        db.add(new_selector)
        db.commit()
        db.refresh(new_selector)
        return new_selector

#this endpoint is the 4th layer of the middleware, the gemini fallback  
@app.post("/heal/", response_model=schemas.HealLogResponse)
async def heal_endpoint(heal_body: schemas.HealRequest, db: Session = Depends(get_db)):

    target_job_id = heal_body.job_id
    target_intent = heal_body.intent

    #just a validation check, not meant for updating the status of job
    the_job = db.query(models.Job).filter(models.Job.job_id == target_job_id).first()
    if not the_job:
        raise HTTPException(status_code=404, detail=f"job with id: {target_job_id} not found")

    selector_row = db.query(models.Selectors).filter(
    models.Selectors.intent == target_intent
).order_by(models.Selectors.updated_at.desc()).first()
    if not selector_row:
        raise HTTPException(status_code=400, detail="No successful run recorded for this intent. Kintsugi can only heal selectors that have worked before.")
    last_success_dom = selector_row.last_success_dom
    current_dom = heal_body.current_dom
  
    prompt = f"""
        You are an expert web automation agent and QA engineer. Your task is to self-heal a broken UI test by finding the correct new CSS selector for an element that has changed and also make sure to cover non-interactive elements as well.

        you will be given a stripped DOM that contains both interactive as well as non-interactive elements, dont disregard the non-interactive elements.

        Here is the historical context of the element when the test last passed:
        --- LAST SUCCESSFUL DOM (stripped DOM) ---
        {last_success_dom}

        Here is the current state of the page:
        --- CURRENT PAGE DOM (again stripped DOM) ---
        {current_dom}

        The functional intent of this element is: "{target_intent}"

        Instructions:
        1. Analyze the 'target_intent' and the 'LAST SUCCESSFUL DOM' to understand the element's core purpose, text content, and semantic role.
        2. Scan the 'CURRENT PAGE DOM' to find the element that best fulfills this intent and matches the historical profile (allow for dynamic classes or changed IDs).
        3. Formulate a robust, unique CSS selector for this new element. Prefer data-attributes, aria-labels, and semantic structure over brittle utility classes.

        Respond ONLY with a valid JSON object in this exact format. Do not use markdown tags (no ```json):
        {{
            "new_selector": "css_selector_here",
            "confidence": 0.0_to_1.0
        }}
    """
    
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

    response = await client.aio.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=f"{prompt}",
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    response_text = response.text.strip()
    if response_text.startswith("```"):
        response_text = re.sub(r"```(?:json)?", "", response_text).strip()
    response_dict = json.loads(response_text)

    new_selector = response_dict.get('new_selector')
    confidence = response_dict.get('confidence')

    #updating the Selectors db table:
    selector_row.selector = new_selector
    selector_row.last_success_dom = current_dom
    selector_row.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(selector_row)

    #saving info in the HealLogs db table healLogs required for the frontend:
    new_heal_log = models.HealLogs(
        job_id = target_job_id,
        intent = target_intent,
        old_selector = heal_body.old_selector,
        new_selector = new_selector,
        current_dom = current_dom,
        confidence = confidence,
        healed_by = 'gemini'
    )
    db.add(new_heal_log)
    db.commit()
    db.refresh(new_heal_log)
    return new_heal_log

@app.post("/heal_logs/", status_code=201)
def new_heal_log(heal_log: schemas.HealLogBase, db: Session = Depends(get_db)):
    new_heal_log = models.HealLogs(**heal_log.model_dump())
    db.add(new_heal_log)
    db.commit()
    db.refresh(new_heal_log)
    return {"message": "heal log saved successfully"}

# change by Tahseen 

# Ensure these imports are at the top
from typing import List

@app.get("/heal_logs/", response_model=List[schemas.HealLogResponse])
def get_heal_logs(db: Session = Depends(get_db)):
    # Even though we query all, the response_model filters it to 2 fields
    return db.query(models.HealLogs).all()

@app.get("/all_selectors/", response_model=List[schemas.SelectorResponse])
def get_all_selectors(db: Session = Depends(get_db)):
    try:
        selectors = db.query(models.Selectors).all()
        return selectors
    except Exception as e:
        print(f"Error fetching selectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))
# check database.py for connection details
# cd backend
# ./venv/bin/python -m uvicorn main:app --reload
# http://127.0.0.1:8000/docs