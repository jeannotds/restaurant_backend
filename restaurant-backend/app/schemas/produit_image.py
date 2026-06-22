from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class ProduitImageCreate(BaseModel):
  produit_id: UUID;
  url_image: str;

class ProduitImageResponse(BaseModel):
  id: UUID;
  produit_id: UUID;
  url_image: str;
  public_id: Optional[str] = None

class ProduitImageUpdate(BaseModel):
  produit_id: UUID;
  url_image: str;

  class Config:
    from_attributes = True;