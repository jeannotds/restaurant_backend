from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel
from app.schemas.produit_image import ProduitImageResponse


class CommandeItemCreate(BaseModel):
  produit_id: UUID;
  quantite: int;

class CommandeItemResponse(BaseModel):
  id: UUID;
  produit_id: UUID;
  quantite: int;
  prix_unitaire: float;
  sous_total: float;  
  
  class Config:
    from_attributes = True;

class CommandeItemUpdate(BaseModel):
  produit_id: Optional[UUID] = None;
  quantite: Optional[int] = None;
  prix_unitaire: Optional[float] = None;
  sous_total: Optional[float] = None;

  class Config:
    from_attributes = True;