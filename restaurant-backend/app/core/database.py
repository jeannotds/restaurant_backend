from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# create_engine : Permet de créer la connexion vers PostgreSQL.
engine = create_engine(DATABASE_URL)

# sessionmaker : Permet de créer une session de base de données.
# Une session sert à : lire des données ; insérer ; modifier ; supprimer.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine  # Permet de lier la session à l'engin de base de données. C'est-à-dire la connexion vers PostgreSQL.
)

# declarative_base : Permet de créer la classe mère de tous les modèles.
Base = declarative_base()

# Rôle : ouvre une session DB par requête HTTP, la ferme après — comme injecter un Repository dans NestJS.
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()