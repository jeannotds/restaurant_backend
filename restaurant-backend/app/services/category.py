from app.models.category import Category
from app.schemas.category import CategoryCreate
from sqlalchemy.orm import Session


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

def get_categories(db: Session):
  categories = db.query(Category).all()
  return categories