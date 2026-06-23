from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel
from app.schemas.produit_image import ProduitImageResponse
from app.schemas.commande_item import CommandeItemCreate, CommandeItemResponse


class CommandeCreate(BaseModel):
  table_id: UUID;
  numero_commande: int;
  statut: str;
  montant_total: float;
  items: List[CommandeItemCreate];
  occupation_id: UUID;

class CommandeResponse(BaseModel):
  id: UUID;
  table_id: UUID;
  numero_commande: int;
  statut: str;
  montant_total: float;
  items: List[CommandeItemResponse];
  occupation_id: Optional[UUID] = None;
  class Config:
    from_attributes = True;

class CommandeUpdate(BaseModel):
  table_id: Optional[UUID] = None;
  numero_commande: Optional[int] = None;
  statut: Optional[str] = None;
  montant_total: Optional[float] = None;
  occupation_id: Optional[UUID] = None;
  class Config:
    from_attributes = True;