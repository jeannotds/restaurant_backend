import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Category(Base):
  __tablename__ = "categories"

  id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
  )

  nom = Column(
    String(100),
    nullable=False,
  )

  description = Column(
    String(255),
    nullable=True,
  )

  restaurant_id = Column(
    UUID(as_uuid=True),
    ForeignKey("restaurants.id"),
    nullable=False,
  )

  create_at = Column(
    DateTime, default=datetime.now, nullable=False,
  )

  update_at = Column(
    DateTime, default=datetime.now, nullable=False,
  )

  
