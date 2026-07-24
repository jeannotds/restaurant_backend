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


class AuthUser(BaseModel):
    id: UUID
    nom: str
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    restaurant_id: Optional[UUID] = None
    is_active: bool

    class Config:
        from_attributes = True


class AuthUserReponse(BaseModel):
    user: AuthUser
    access_token: str
    refresh_token: str
    token_type: str

class AuthUserLogin(BaseModel):
    email: Optional[str] = None
    telephone: Optional[str] = None
    password: str


class AuthUserChangeRestaurant(BaseModel):
    restaurant_id: UUID
    class Config:
        from_attributes = True
