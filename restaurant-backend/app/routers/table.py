from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.schemas.table import TableCreate, TableResponse
from app.services import table as table_service

router = APIRouter(
  prefix="/tables",
  tags=["Tables"],
)

@router.post("/", response_model=TableResponse, status_code=201)
def create_table(data: TableCreate, db: Session = Depends(get_db)):
  return table_service.create_table(db, data)

@router.get("/", response_model=List[TableResponse], status_code=201)
def all_table(db: Session = Depends(get_db)):
  return table_service.get_tables(db)

@router.get("/{table_id}", response_model=TableResponse, status_code=201)
def get_table(table_id: UUID, db: Session = Depends(get_db)):
  table = table_service.get_table_by_id(db, table_id)
  if not table:
      raise HTTPException(status_code=404, detail="Table introuvable")
  return table
