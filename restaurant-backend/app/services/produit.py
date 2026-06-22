from ast import Delete
from datetime import datetime
from typing import Optional
from uuid import UUID
from app.models.produit import Produit
from app.models.produit_image import ProduitImage
from app.schemas.produit import ProduitCreate, ProduitUpdate
from sqlalchemy.orm import Session


def create_produit(db: Session, data: ProduitCreate):
  produit = Produit(
    nom = data.nom,
    description = data.description,
    price = data.price,
    disponible = data.disponible,
    categorie_id = data.categorie_id,
    restaurant_id = data.restaurant_id,
  )
  db.add(produit)
  db.commit()
  db.refresh(produit)

  if data.images and len(data.images) > 0:
    for img in data.images:
      image = ProduitImage(
        produit_id=produit.id, 
        url_image=img
      )
      db.add(image)
      db.commit()
      db.refresh(image)

  return produit

def get_produits(db: Session, restaurant_id: Optional[UUID] = None):
  # return db.query(Produit).all()
  query = db.query(Produit)
  if restaurant_id:
    query = query.filter(Produit.restaurant_id == restaurant_id)
  return query.all()

def delete_produit(produit_id, db: Session):
  produit = db.query(Produit).filter(Produit.id == produit_id).first()

  if not produit:
    return None

  db.delete(produit)
  db.commit()
  return { "message": "Produit supprimé avec succès", "produit": produit }

def update_produit(produit_id, db: Session, data: ProduitUpdate):
  produit = db.query(Produit).filter(Produit.id == produit_id).first()

  if not produit:
    return None

  if data.nom is not None:
    produit.nom = data.nom
  if data.description is not None:
    produit.description = data.description
  if data.price is not None:
    produit.price = data.price
  if data.disponible is not None:
    produit.disponible = data.disponible
  if data.categorie_id is not None:
    produit.categorie_id = data.categorie_id
  if data.restaurant_id is not None:
    produit.restaurant_id = data.restaurant_id
  
  produit.update_at = datetime.now()

  if data.images is not None:
    # supprime anciennes images
    db.query(ProduitImage).filter(ProduitImage.produit_id == produit_id).delete()
    
    # recrée nouvelles images
    for img in data.images:
      image = ProduitImage(produit_id=produit_id, url_image=img)
      db.add(image)

  db.commit()
  db.refresh(produit)
  return produit
