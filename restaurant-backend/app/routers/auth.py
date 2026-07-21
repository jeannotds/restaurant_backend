from app.schemas.user import AuthUserCreate, AuthUserReponse
from fastapi import APIRouter, Depends
from app.services import auth as auth_service
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup", response_model=AuthUserReponse, status_code=201)
def signup(data: AuthUserCreate, db: Session = Depends(get_db)):
    return auth_service.signup(db, data)
