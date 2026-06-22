from typing import Optional
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from sqlalchemy.orm import Session
from uuid import UUID


def create_category(db: Session, data: CategoryCreate):

    category = Category(**data.dict())
    # category = Category(
    #    **data.model_dump()
    # )
    # category = Category(
    #   nom=data.nom,
    #   description=data.description,
    #   restaurant_id=data.restaurant_id,
    # )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def get_categories(db: Session, restaurant_id: Optional[UUID] = None):
  query = db.query(Category)
  if restaurant_id:
    query = query.filter(Category.restaurant_id == restaurant_id)
  return query.all()

def update_category(db: Session, category_id: UUID, data: CategoryUpdate):
  category = db.query(Category).filter(Category.id == category_id).first()

  if not category:
    return None

  if data.nom is not None:
    category.nom = data.nom
  if data.description is not None:
    category.description = data.description
  if data.restaurant_id is not None:
    category.restaurant_id = data.restaurant_id

  db.commit()
  db.refresh(category)
  return category
