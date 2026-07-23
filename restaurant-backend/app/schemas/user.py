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


class AuthUserReponse(BaseModel):
    id: UUID
    nom: str
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    restaurant_id: Optional[UUID] = None
    is_active: bool

class AuthUserLogin(BaseModel):
    email: Optional[str] = None;
    telephone: Optional[str] = None;
    password: str;

    class Config:
        from_attributes = True
