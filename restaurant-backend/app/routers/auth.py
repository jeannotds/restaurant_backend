from app.schemas.user import (
    AuthUser,
    AuthUserCreate,
    AuthUserReponse,
    AuthUserLogin,
    AuthUserChangeRestaurant,
)
from fastapi import APIRouter, Depends, Request
from app.services import auth as auth_service
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.core.rate_limit import limiter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup", response_model=AuthUserReponse, status_code=201)
@limiter.limit("5/minute")
def signup(request: Request, data: AuthUserCreate, db: Session = Depends(get_db)):
    return auth_service.signup(db, data)


@router.post("/login", response_model=AuthUserReponse, status_code=201)
@limiter.limit("5/minute")
def login(request: Request, data: AuthUserLogin, db: Session = Depends(get_db)):
    return auth_service.login(db, data)


@router.put("/change-restaurant", response_model=AuthUser, status_code=200)
@limiter.limit("5/minute")
def change_restaurant(
        request: Request,
        data: AuthUserChangeRestaurant,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)):
    return auth_service.change_restaurant(db, data, current_user)


@router.get("/me", response_model=AuthUser)
def me(current_user: User = Depends(get_current_user)):
    return current_user
