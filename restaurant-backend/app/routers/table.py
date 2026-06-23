from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from fastapi import Query
from app.core.database import get_db
from app.schemas.table import TableCreate, TableResponse, TableUpdate
from app.services import table as table_service
from app.schemas.table_occupation import TableJoinRequest, TableJoinResponse
from app.services import table_occupation as table_occupation_service


router = APIRouter(
  prefix="/tables",
  tags=["Tables"],
)

@router.post("/", response_model=TableResponse, status_code=201)
def create_table(data: TableCreate, db: Session = Depends(get_db)):
  return table_service.create_table(db, data)

@router.get("/", response_model=List[TableResponse], status_code=201)
def all_table(restaurant_id: Optional[UUID] = Query(None), db: Session = Depends(get_db)):
  return table_service.get_tables(db, restaurant_id)

@router.get("/{table_id}", response_model=TableResponse, status_code=201)
def get_table(table_id: UUID, db: Session = Depends(get_db)):
  table = table_service.get_table_by_id(db, table_id)
  if not table:
      raise HTTPException(status_code=404, detail="Table introuvable")
  return table

@router.put("/{table_id}", response_model=TableResponse, status_code=201)
def update_table(table_id: UUID, data: TableUpdate, db: Session = Depends(get_db)):
  table = table_service.update_table(db, table_id, data)
  if not table:
    raise HTTPException(status_code=404, detail="Table introuvable")
  return table

@router.post("/{table_id}/join", response_model=TableJoinResponse, status_code=200)
def join_table(table_id: UUID, data: TableJoinRequest, db: Session = Depends(get_db)):
  occupation,table = table_occupation_service.join_table(db, table_id, data)
  if not occupation or not table:
    raise HTTPException(status_code=404, detail="Table introuvable")
  return TableJoinResponse(
    occupation_id=occupation.id,
    table_id=table.id,
    table_numero=table.numero or 0,
    nombre_de_places=occupation.nombre_de_places,
    places_occupees=table.places_occupees,
    places_libres= max(0, (table.capacity or 0) - (table.places_occupees or 0)),
    status=table.status,
  )

@router.post("/occupations/{occupation_id}/end", status_code=200)
def end_occupation(occupation_id: UUID, db: Session = Depends(get_db)):
  result = table_occupation_service.end_occupation(db, occupation_id)
  if not result:
    raise HTTPException(status_code=404, detail="Occupation introuvable ou déjà terminée")
  occupation, table = result
  return {
    "message": "Occupation terminée",
    "occupation_id": occupation.id,
    "places_occupees": table.places_occupees,
    "places_libres": table.capacity - table.places_occupees,
    "status": table.status,
  }

# @router.post("/{occupation_id}/end", response_model=TableJoinResponse, status_code=201)
# def end_occupation(occupation_id: UUID, db: Session = Depends(get_db)):
#   occupation,table = table_occupation_service.end_occupation(db, occupation_id)
#   if not occupation or not table:
#     raise HTTPException(status_code=404, detail="Occupation non trouvée")
#   return TableJoinResponse(
#     occupation_id=occupation.id,
#     table_id=table.id,
#     table_numero=table.numero,
#     nombre_de_places=occupation.nombre_de_places,
#     places_occupees=table.places_occupees,
#     places_libres=table.capacity - table.places_occupees or 0,
#     status=table.status,
#   )