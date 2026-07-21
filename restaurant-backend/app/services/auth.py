from app.schemas.user import AuthUserCreate
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password
from sqlalchemy import or_
from fastapi import HTTPException

def signup(db: Session, data: AuthUserCreate):

  existing = db.query(User).filter(or_(User.email == data.email, User.telephone == data.telephone)).first()

  if existing:
    raise HTTPException(status_code=400, detail="Email déjà utilisé")

  # user = User(**data.dict())
  user = User(
    nom=data.nom,
    prenom=data.prenom,
    email=data.email,
    telephone=data.telephone,
    password=hash_password(data.password),
    restaurant_id=data.restaurant_id,
    is_active=False
  )

  db.add(user)
  db.commit()
  db.refresh(user)

  return user