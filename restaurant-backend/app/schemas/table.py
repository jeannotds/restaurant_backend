from typing import Optional
from uuid import UUID

from pydantic import BaseModel

class TableCreate(BaseModel):
  numero: int;
  capacity: int;
  status: str;
  code_acces: Optional[str] = None;
  restaurant_id: UUID;
  places_occupees: int = 0;

class TableResponse(BaseModel):
  id: UUID;
  numero: int;
  capacity: int;
  status: str;
  code_acces: Optional[str] = None;
  restaurant_id: UUID;
  places_occupees: int;

class TableUpdate(BaseModel):
  numero: Optional[int] = None;
  capacity: Optional[int] = None;
  status: Optional[str] = None;
  code_acces: Optional[str] = None;
  restaurant_id: Optional[UUID] = None;
  places_occupees: Optional[int] = None;

  class Config:
    from_attributes = True;
