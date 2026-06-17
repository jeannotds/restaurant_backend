from fastapi import APIRouter, Depends
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