from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator

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
  places_occupees: int = 0;

  @field_validator("places_occupees", mode="before")
  @classmethod
  def coerce_places_occupees(cls, v):
    return 0 if v is None else v

  class Config:
    from_attributes = True;

class TableUpdate(BaseModel):
  numero: Optional[int] = None;
  capacity: Optional[int] = None;
  status: Optional[str] = None;
  code_acces: Optional[str] = None;
  restaurant_id: Optional[UUID] = None;
  places_occupees: Optional[int] = None;

  class Config:
    from_attributes = True;
