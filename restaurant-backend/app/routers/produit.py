from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi import Query

from app.core.database import get_db
from app.schemas.produit import ProduitCreate, ProduitResponse, ProduitUpdate
from app.schemas.produit_image import ProduitImageResponse
from app.services import produit as produit_service

router = APIRouter(
  prefix="/produits",
  tags=["Produits"]
)


@router.post("/", response_model=ProduitResponse, status_code=201)
def create_produit(data: ProduitCreate, db: Session = Depends(get_db)):
  return produit_service.create_produit(db, data)

@router.get("/", response_model=List[ProduitResponse], status_code=200)
def list_produits(restaurant_id: Optional[UUID] = Query(None), db: Session = Depends(get_db)):
  return produit_service.get_produits(db, restaurant_id)

@router.post("/{id_produit}/images", response_model=ProduitImageResponse, status_code=201)
async def upload_produit_image(
  id_produit: UUID,
  file: UploadFile = File(...),
  db: Session = Depends(get_db),
):
  print("upload_produit_image : ", file)
  image = produit_service.add_image_to_produit(db, id_produit, file)
  if not image:
    raise HTTPException(status_code=404, detail="Produit introuvable")
  return image

@router.delete("/{id_produit}", status_code=201)
def delete_produit(id_produit: UUID, db: Session = Depends(get_db)):
  produit = produit_service.delete_produit(id_produit, db)
  if not produit:
    raise HTTPException(status_code = 404, detail="Produit not found")
  return produit

@router.put("/{id_produit}", response_model=ProduitResponse, status_code=201)
def update_produit(id_produit: UUID, data: ProduitUpdate, db: Session = Depends(get_db)):
  produits = produit_service.update_produit(id_produit, db, data)

  if not produits:
    raise HTTPException(status_code = 404, detail="Produit not found")
  return produits
