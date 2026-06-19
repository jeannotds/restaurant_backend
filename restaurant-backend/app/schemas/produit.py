from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel
from app.schemas.produit_image import ProduitImageResponse


class ProduitCreate(BaseModel):
  nom: str;
  description: Optional[str] = None;
  price: float;
  disponible: bool;
  categorie_id: UUID;
  restaurant_id: UUID;
  images: Optional[list[str]] = None

class ProduitResponse(BaseModel):
  id: UUID;
  nom: str;
  description: Optional[str] = None;
  price: float;
  disponible: bool;
  categorie_id: UUID;
  restaurant_id: UUID;
  images: List[ProduitImageResponse] = []
  
  class Config:
    from_attributes = True;

class ProduitUpdate(BaseModel):
  nom: Optional[str] = None;
  description: Optional[str] = None;
  price: Optional[float] = None;
  disponible: Optional[bool] = None;
  categorie_id: Optional[UUID] = None;
  restaurant_id: Optional[UUID] = None;
  images: Optional[list[str]] = None

  class Config:
    from_attributes = True;