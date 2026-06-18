from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class CategoryCreate(BaseModel):
  nom: str;
  description: Optional[str] = None;
  restaurant_id: UUID;

class CategoryResponse(BaseModel):
  id: UUID;
  nom: str;
  description: Optional[str] = None;
  restaurant_id: UUID;

class CategoryUpdate(BaseModel):
  nom: str;
  description: Optional[str] = None;
  restaurant_id: UUID;

  class Config:
    from_attributes = True;