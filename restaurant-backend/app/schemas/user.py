from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class AuthUserCreate(BaseModel):
    nom: str
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    password: str
    restaurant_id: Optional[UUID] = None
    is_active: Optional[bool] = True


class AuthUserReponse(BaseModel):
    id: UUID
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    password: str
    restaurant_id: Optional[UUID] = None
    is_active: Optional[bool] = False

    class Config:
        from_attributes = True
