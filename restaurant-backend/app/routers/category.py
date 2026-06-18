from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services import category as category_service
from app.core.database import get_db

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return category_service.create_category(db, data)


@router.get("/", response_model=List[CategoryResponse], status_code=201)
def get_category(db: Session = Depends(get_db)):
    return category_service.get_categories(db)


@router.put("/{category_id}", response_model=CategoryResponse, status_code=201)
def update_category(category_id: UUID, data: CategoryUpdate, db: Session = Depends(get_db)):
    category = category_service.update_category(db, category_id, data)

    if not category:
      raise HTTPException(status_code=404, detail="Category not found")

    return category
