from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.schemas.restaurant import RestaurantCreate, RestaurantResponse, RestaurantStatsResponse
from app.services import restaurant as restaurant_service

router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"]
)

@router.post("/", response_model=RestaurantResponse, status_code=201)
def create_restaurant(data: RestaurantCreate, db: Session = Depends(get_db)):
    return restaurant_service.create_restaurant(db, data)

@router.get("/", response_model=List[RestaurantResponse])
def list_restaurants(db: Session = Depends(get_db)):
    return restaurant_service.get_restaurants(db)

@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: UUID, db: Session = Depends(get_db)):
    restaurant = restaurant_service.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable")
    return restaurant

@router.get("/{restaurant_id}/stats", response_model=RestaurantStatsResponse)
def get_restaurant_stats(restaurant_id: UUID, db: Session = Depends(get_db)):
    restaurant_stats =  restaurant_service.get_restaurant_stats(db, restaurant_id)
    if not restaurant_stats:
        raise HTTPException(status_code=404, detail="Restaurant introuvable")
    return restaurant_stats