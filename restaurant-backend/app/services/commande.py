from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.schemas.commande import CommandeCreate, CommandeResponse, CommandeUpdate, CommandeItemCreate
from app.models.commande import Commande
from app.models.table import Table
from app.models.commande_item import CommandeItem
from app.models.produit import Produit
from app.models.table_occupation import TableOccupation

def create_commande(db: Session, data: CommandeCreate):

    # vérifier si l'occupation existe et est active
    occupation = db.query(TableOccupation).filter(
      TableOccupation.id == data.occupation_id,
      TableOccupation.table_id == data.table_id,
      TableOccupation.status == "ACTIVE",
    ).first()

    if not occupation:
        raise HTTPException(status_code=403, detail="Occupation non trouvée")

    table = db.query(Table).filter(Table.id == data.table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table introuvable")

    if occupation.restaurant_id != table.restaurant_id:
        raise HTTPException(
            status_code=403,
            detail="Occupation invalide pour ce restaurant",
        )

    commande = Commande(
        table_id=data.table_id,
        numero_commande=data.numero_commande,
        occupation_id=occupation.id,
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
        raise HTTPException(status_code=403, detail=f"Produit {item.produit_id} non trouvé")

      if produit.restaurant_id != table.restaurant_id:
        raise HTTPException(
            status_code=403,
            detail="Impossible de commander un produit d'un autre restaurant",
        )

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

# def get_commandes(db: Session):
#     return db.query(Commande).all()

def get_commandes(db: Session, restaurant_id: Optional[UUID] = None):
    # query = db.query(Commande).join(Table).filter(Table.restaurant_id == restaurant_id)
    query = db.query(Commande)
    if restaurant_id:
        query = query.join(Table).filter(Table.restaurant_id == restaurant_id)
    return query.all()


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
    if data.occupation_id is not None:
        commande.occupation_id = data.occupation_id

    db.commit()
    db.refresh(commande)
    return commande

def get_commande_by_id(id_commande: UUID, db: Session):
  commande = db.query(Commande).filter(Commande.id == id_commande).first()
  if not commande:
    return None
  return commande

def get_commande_by_id_and_restaurant(id_commande: UUID, id_restaurant: UUID, db: Session):
  print("test", id_commande, id_restaurant)
  # commande = db.query(Commande).filter(Commande.id == id_commande and Commande.restaurant_id == id_restaurant).first()
  commande = db.query(Commande).filter(Commande.id == id_commande).first()
  if not commande:
    return None
  return commande