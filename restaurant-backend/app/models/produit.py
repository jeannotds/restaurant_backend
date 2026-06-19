import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.produit_image import ProduitImage

class Produit(Base):
  __tablename__ = "produits"

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

  price = Column(
    Float,
    nullable=False,
    default=0.0,
  )

  disponible = Column(
    Boolean,
    nullable=False,
    default=True,
  )

  images = relationship(
    "ProduitImage",
    #  backref="produit", 
    back_populates="produit",
    cascade="all, delete-orphan"
  )

  restaurant_id = Column(
    UUID(as_uuid=True),
    ForeignKey("restaurants.id"),
    nullable=False,
  )

  categorie_id = Column(
    UUID(as_uuid=True),
    ForeignKey("categories.id"),
    nullable=False,
  )

  create_at = Column(
    DateTime, default=datetime.now, nullable=False,
  )

  update_at = Column(
    DateTime, default=datetime.now, nullable=False,
  )

  
