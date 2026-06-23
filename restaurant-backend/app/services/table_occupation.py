
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException
from app.models.table import Table
from app.models.table_occupation import TableOccupation
from app.schemas.table_occupation import TableJoinRequest
from sqlalchemy.orm import Session  
from app.enums.occupation_status import OccupationStatus

def join_table(db: Session, table_id: UUID, data: TableJoinRequest):
  table = db.query(Table).filter(Table.id == table_id).first()

  if not table:
    raise HTTPException(status_code=404, detail="Table introuvable")

  if table.status == "RESERVEE":
    raise HTTPException(status_code=403, detail="Table réservée")

  if table.code_acces is None or table.code_acces.upper() != data.code_acces.strip().upper():
    raise HTTPException(403, "Code d'accès invalide")

  places_libres = table.capacity - (table.places_occupees or 0)
  if data.nombre_de_places > places_libres:
    raise HTTPException(
      409, f"Nombre de places insuffisant. {places_libres} places libres"
    )

  # table_occupation = occupation
  occupation = TableOccupation(
    table_id=table_id,
    restaurant_id=table.restaurant_id,
    # client_name=data.client_name,
    # telephone=data.telephone,
    status="ACTIVE",
    nombre_de_places=data.nombre_de_places,
  )

  db.add(occupation)

  table.places_occupees = (table.places_occupees or 0) + data.nombre_de_places

  table.status = _compute_table_status(table)

  db.commit()
  db.refresh(occupation)
  db.refresh(table)

  return occupation, table


# fonction utilitaire pour calculer le statut de la table
def _compute_table_status(table):
    if table.places_occupees >= table.capacity:
        return "OCCUPEE"
    if table.places_occupees > 0:
        return "PARTIELLE"
    return "LIBRE"

def end_occupation(db: Session, occupation_id: UUID):

  occupation = db.query(TableOccupation).filter(
      TableOccupation.id == occupation_id,
      TableOccupation.status == OccupationStatus.ACTIVE.value,
  ).first()

  if not occupation:
      return None  # ou HTTPException 404
  
  table = db.query(Table).filter(Table.id == occupation.table_id).first()

  if not table:
    raise HTTPException(status_code=404, detail="Table non trouvé")

  occupation.status = OccupationStatus.TERMINEE.value

  occupation.ended_at = datetime.now()

  table.places_occupees = max(0, (table.places_occupees or 0) - occupation.nombre_de_places)

  table.status = _compute_table_status(table)

  db.commit()
  db.refresh(occupation)
  db.refresh(table)
  return occupation, table
  


