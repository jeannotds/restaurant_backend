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


class RestaurantStatsResponse(BaseModel):
    tables_total: int
    tables_occupees: int
    places_total: int
    places_occupees: int
    places_libres: int
    commandes_actives: int
    produits_total: int
    produits_disponibles: int
    places_reservées: int
    produits_non_disponibles: int

class RestaurantResponse(BaseModel):

    id: UUID
    nom: str
    adresse: str
    telephone: str

    class Config:
        from_attributes = True