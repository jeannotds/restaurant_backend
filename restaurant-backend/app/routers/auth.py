from app.schemas.user import AuthUserCreate, AuthUserReponse, AuthUserLogin, AuthUserChangeRestaurant
from fastapi import APIRouter, Depends
from app.services import auth as auth_service
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup", response_model=AuthUserReponse, status_code=201)
def signup(data: AuthUserCreate, db: Session = Depends(get_db)):
    return auth_service.signup(db, data)


@router.post("/login", response_model=AuthUserReponse, status_code=201)
def login(data: AuthUserLogin, db: Session = Depends(get_db)):
    return auth_service.login(db, data)


@router.put("/change-restaurant", response_model=AuthUserReponse, status_code=200)
def change_restaurant(data: AuthUserChangeRestaurant, db: Session = Depends(get_db)):
    return auth_service.change_restaurant(db, data)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return current_user
