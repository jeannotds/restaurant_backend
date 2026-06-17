from sqlalchemy.orm import Session
from app.models.table import Table
from app.schemas.table import TableCreate, TableResponse

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

def get_tables(db: Session):
  return db.query(Table).all()