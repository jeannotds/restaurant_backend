from uuid import UUID

from pydantic import BaseModel

class TableCreate(BaseModel):
  numero: int;
  capacity: int;
  status: str;
  code_acces: str;
  restaurant_id: UUID;

class TableResponse(BaseModel):
  id: UUID;
  numero: int;
  capacity: int;
  status: str;
  code_acces: str;
  restaurant_id: UUID;

  class Config:
    from_attributes = True;
