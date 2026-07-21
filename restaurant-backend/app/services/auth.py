from app.schemas.user import AuthUserCreate
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.restaurant import Restaurant
from app.core.security import hash_password
from sqlalchemy import or_
from fastapi import HTTPException


def signup(db: Session, data: AuthUserCreate):
    if not data.email and not data.telephone:
        raise HTTPException(
            status_code=400,
            detail="Email ou téléphone requis",
        )

    filters = []
    if data.email:
        filters.append(User.email == data.email)
    if data.telephone:
        filters.append(User.telephone == data.telephone)

    existing = db.query(User).filter(or_(*filters)).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email ou téléphone déjà utilisé",
        )

    if data.restaurant_id:
        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.id == data.restaurant_id)
            .first()
        )
        if not restaurant:
            raise HTTPException(
                status_code=404,
                detail="Restaurant introuvable",
            )

    user = User(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        telephone=data.telephone,
        password=hash_password(data.password),
        restaurant_id=data.restaurant_id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user