from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.commande import CommandeCreate, CommandeResponse, CommandeUpdate, CommandeItemCreate
from app.models.commande import Commande
from app.models.commande_item import CommandeItem
from app.models.produit import Produit

def create_commande(db: Session, data: CommandeCreate):
    commande = Commande(
        table_id=data.table_id,
        numero_commande=data.numero_commande,
        statut=data.statut,
        montant_total=data.montant_total,
    )
    db.add(commande)
    db.flush()  # récupère commande.id sans commit
    # db.commit()
    # db.refresh(commande)

    total = 0
    
    for item in data.items:
      produit = db.query(Produit).filter(Produit.id == item.produit_id).first()

      if not produit:
        raise HTTPException(status_code=404, detail=f"Produit {item.produit_id} non trouvé")

      sous_total = produit.price * item.quantite

      commande_item = CommandeItem(
        commande_id=commande.id,
        produit_id=item.produit_id,
        quantite=item.quantite,
        prix_unitaire=produit.price,
        sous_total=sous_total,
      )

      db.add(commande_item)

      total += sous_total

    commande.montant_total = total
    db.commit()
    db.refresh(commande)
    return commande

def get_commandes(db: Session):
    return db.query(Commande).all()

def delete_commande(id_commande: UUID, db: Session):
    commande = db.query(Commande).filter(Commande.id == id_commande).first()
    if not commande:
        return None
    db.delete(commande)
    db.commit()
    return commande

def update_commande(id_commande: UUID, db: Session, data: CommandeUpdate):
    commande = db.query(Commande).filter(Commande.id == id_commande).first()
    if not commande:
        return None

    if data.table_id is not None:
        commande.table_id = data.table_id
    if data.numero_commande is not None:
        commande.numero_commande = data.numero_commande
    if data.statut is not None:
        commande.statut = data.statut
    if data.montant_total is not None:
        commande.montant_total = data.montant_total
      
    db.commit()
    db.refresh(commande)
    return commande

def get_commande_by_id(id_commande: UUID, db: Session):
  commande = db.query(Commande).filter(Commande.id == id_commande).first()
  if not commande:
    return None
  return commande