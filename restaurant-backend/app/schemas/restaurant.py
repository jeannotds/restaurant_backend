from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RestaurantCreate(BaseModel):

    nom: str
    adresse: str
    telephone: str

class RestaurantUpdate(BaseModel):

    nom: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None


class RestaurantResponse(BaseModel):

    id: UUID
    nom: str
    adresse: str
    telephone: str

    class Config:
        from_attributes = True