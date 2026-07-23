from app.schemas.user import AuthUserCreate, AuthUserChangeRestaurant
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.restaurant import Restaurant
from app.core.security import hash_password, verify_password
from sqlalchemy import or_
from fastapi import HTTPException
from app.schemas.user import AuthUserLogin


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

    for filter in filters:
        print('filter : ', filter)

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


def login(db: Session, data: AuthUserLogin):
    if not data.email and not data.telephone:
        raise HTTPException(
            status_code=400, detail="Email ou téléphone requis")

    filters = []

    if data.email:
        filters.append(User.email == data.email)
    if data.telephone:
        filters.append(User.telephone == data.telephone)

    user = db.query(User).filter(or_(*filters)).first()

    if not user:
        raise HTTPException(
            status_code=400, detail="Password or email/telephone incorrect")

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=400, detail="Password or email/telephone incorrect")

    return user


def change_restaurant(db: Session, data: AuthUserChangeRestaurant):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=400, detail="Restaurant not found")

    user.restaurant_id = data.restaurant_id

    db.commit()
    db.refresh(user)
    return user
