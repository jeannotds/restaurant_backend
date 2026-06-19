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
  numero: Optional[int] = None;
  capacity: Optional[int] = None;
  status: Optional[str] = None;
  code_acces: Optional[str] = None;
  restaurant_id: Optional[UUID] = None;

  class Config:
    from_attributes = True;
