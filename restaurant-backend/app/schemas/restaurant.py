from uuid import UUID

from pydantic import BaseModel


class RestaurantCreate(BaseModel):

    nom: str
    adresse: str
    telephone: str


class RestaurantResponse(BaseModel):

    id: UUID
    nom: str
    adresse: str
    telephone: str

    class Config:
        from_attributes = True