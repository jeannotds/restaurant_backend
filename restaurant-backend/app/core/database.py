from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Rôle : ouvre une session DB par requête HTTP, la ferme après — comme injecter un Repository dans NestJS.

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()