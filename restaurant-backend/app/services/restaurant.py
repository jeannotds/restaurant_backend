from sqlalchemy.orm import Session
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantCreate

def create_restaurant(db: Session, data: RestaurantCreate):
    restaurant = Restaurant(
        nom=data.nom,
        adresse=data.adresse,
        telephone=data.telephone
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant

def get_restaurants(db: Session):
    return db.query(Restaurant).all()

def get_restaurant_by_id(db: Session, restaurant_id):
    return db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()