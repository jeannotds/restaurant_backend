import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.produit import Produit

class ProduitImage(Base):
  __tablename__ = "produit_images"

  id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
  )

  produit = relationship("Produit", back_populates="images")

  produit_id = Column(
    UUID(as_uuid=True),
    ForeignKey("produits.id"),
    nullable=False, index=True,
  )

  url_image = Column(
    String(500),
    nullable=False, index=True,
  )

  create_at = Column(
    DateTime, default=datetime.now, nullable=False,
  )

  update_at = Column(
    DateTime, default=datetime.now, nullable=False,
  )