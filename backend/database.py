from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
load_dotenv()

postgres_password = os.getenv('POSTGRES_PASSWORD')
SQLALCHEMY_DATABASE_URL = f"postgresql://postgres:{postgres_password}@localhost:5432/kintsugi_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# sudo -u postgres psql
# CREATE DATABASE kintsugi_db;
#for testing create a .env file at root level and put your postgres password inside of a variable named POSTGRES_PASSWORD
#example: inside .env: POSTGRES_PASSWORD = 'your_password'