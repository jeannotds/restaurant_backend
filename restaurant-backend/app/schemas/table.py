from typing import Optional
from uuid import UUID

from pydantic import BaseModel

class TableCreate(BaseModel):
  numero: int;
  capacity: int;
  status: str;
  code_acces: Optional[str] = None;
  restaurant_id: UUID;

class TableResponse(BaseModel):
  id: UUID;
  numero: int;
  capacity: int;
  status: str;
  code_acces: Optional[str] = None;
  restaurant_id: UUID;

class TableUpdate(BaseModel):
  numero: int;
  capacity: int;
  status: str;
  code_acces: Optional[str] = None;
  restaurant_id: UUID;

  class Config:
    from_attributes = True;
