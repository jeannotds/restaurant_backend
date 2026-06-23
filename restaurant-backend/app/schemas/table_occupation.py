from typing import Optional
from uuid import UUID

from pydantic import BaseModel

class TableJoinRequest(BaseModel):
    code_acces: str
    nombre_de_places: int  # >= 1

class TableJoinResponse(BaseModel):
    occupation_id: UUID
    table_id: UUID
    table_numero: int
    nombre_de_places: int
    places_occupees: int
    places_libres: int
    status: str

class TableEndOccupationResponse(BaseModel):
    message: str
    occupation_id: UUID
    places_occupees: int
    places_libres: int
    status: str

    class Config:
        from_attributes = True