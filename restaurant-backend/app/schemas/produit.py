from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class ProduitCreate(BaseModel):
  nom: str;
  description: Optional[str] = None;
  price: float;
  disponible: bool;
  categorie_id: UUID;
  restaurant_id: UUID;
  images: List[UUID];

class ProduitResponse(BaseModel):
  id: UUID;
  nom: str;
  description: Optional[str] = None;
  price: float;
  disponible: bool;
  categorie_id: UUID;
  restaurant_id: UUID;
  images = List[UUID];

class ProduitUpdate(BaseModel):
  nom: str;
  description: Optional[str] = None;
  price: float;
  disponible: bool;
  categorie_id: UUID;
  restaurant_id: UUID;
  images = List[UUID];

  class Config:
    from_attributes = True;