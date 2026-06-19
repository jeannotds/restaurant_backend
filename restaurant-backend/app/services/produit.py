from app.models.produit import Produit
from app.models.produit_image import ProduitImage
from app.schemas.produit import ProduitCreate
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