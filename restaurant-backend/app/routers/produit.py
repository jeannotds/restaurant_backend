from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.produit import ProduitCreate, ProduitResponse
from app.services import produit as produit_service

router = APIRouter(
  prefix="/produits",
  tags=["Produits"]
)


@router.post("/", response_model=ProduitResponse, status_code=201)
def create_produit(data: ProduitCreate, db: Session = Depends(get_db)):
  return produit_service.create_produit(db, data)