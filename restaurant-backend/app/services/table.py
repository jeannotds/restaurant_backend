from typing import Optional
from sqlalchemy.orm import Session
from app.models.table import Table
from app.schemas.table import TableCreate, TableResponse, TableUpdate
from uuid import UUID

def create_table(db: Session, data: TableCreate):

  table = Table(
    numero=data.numero,
    capacity=data.capacity,
    status=data.status,
    code_acces=data.code_acces,
    restaurant_id=data.restaurant_id,
  )
  db.add(table)
  db.commit()
  db.refresh(table)
  return table

# def get_tables(db: Session):
#   return db.query(Table).all()

def get_tables(db: Session, restaurant_id: Optional[UUID] = None):
    query = db.query(Table)
    if restaurant_id:
        query = query.filter(Table.restaurant_id == restaurant_id)
    return query.all()

def get_table_by_id(db: Session, table_id: UUID):
  return db.query(Table).filter(Table.id == table_id).first()
  # db.execute(select(Table).where(Table.id == table_id)).scalar_one_or_none()

def update_table(db: Session, table_id: UUID, data: TableUpdate):
  table = db.query(Table).filter(Table.id == table_id).first()

  if not table:
    return None

  if data.numero is not None:
    table.numero = data.numero
  if data.capacity is not None:
    table.capacity = data.capacity
  if data.status is not None:
    table.status = data.status
  if data.code_acces is not None:
    table.code_acces = data.code_acces
  if data.restaurant_id is not None:
    table.restaurant_id = data.restaurant_id

  db.commit()
  db.refresh(table)
  return table

def get_all_tables_by_restaurant(db: Session, restaurant_id: UUID):
  return db.query(Table).filter(Table.restaurant_id == restaurant_id).all()