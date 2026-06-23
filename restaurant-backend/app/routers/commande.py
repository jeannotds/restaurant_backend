from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.commande import CommandeCreate, CommandeResponse, CommandeUpdate
from app.schemas.commande_item import CommandeItemResponse
from app.services import commande as commande_service

router = APIRouter(
    prefix="/commandes",
    tags=["Commandes"]
)

@router.post("/", response_model=CommandeResponse, status_code=201)
def create_commande(data: CommandeCreate, db: Session = Depends(get_db)):
    return commande_service.create_commande(db, data)

# @router.get("/", response_model=List[CommandeResponse])
# def list_commandes(db: Session = Depends(get_db)):
#     return commande_service.get_commandes(db)

@router.get("/", response_model=List[CommandeResponse], status_code=201)
def get_commande_items(
    restaurant_id: Optional[UUID] = Query(None), 
    db: Session = Depends(get_db)
  ):
      return commande_service.get_commandes(db, restaurant_id)

@router.delete("/{id_commande}", status_code=201)
def delete_commande(id_commande: UUID, db: Session = Depends(get_db)):
    coammnde = commande_service.delete_commande(id_commande, db)
    if not coammnde:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return coammnde

@router.put("/{id_commande}", response_model=CommandeResponse, status_code=201)
def update_commande(
    id_commande: UUID, 
    data: CommandeUpdate, 
    db: Session = Depends(get_db)
):
    commande = commande_service.update_commande(id_commande, db, data)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande

@router.get("/{id_commande}", response_model=CommandeResponse, status_code=201)
def get_commande_by_id(id_commande: UUID, db: Session = Depends(get_db)):
  commande = commande_service.get_commande_by_id(id_commande, db)

  if not commande:
    raise HTTPException(status_code=404, detail="Commande non trouvée")
  return commande
