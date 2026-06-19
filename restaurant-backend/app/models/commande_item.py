
from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, DateTime, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from sqlalchemy.orm import relationship

class CommandeItem(Base):
  __tablename__ = "commande_items"

  id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
  )

  commande_id = Column(
    UUID(as_uuid=True),
    ForeignKey("commandes.id"),
    nullable=False,
  )

  commande = relationship("Commande", back_populates="items")

  produit_id = Column(
    UUID(as_uuid=True),
    ForeignKey("produits.id"),
    nullable=False,
  )

  quantite = Column(
    Integer,
    nullable=False,
    default=0,
  )

  prix_unitaire = Column(
    Float,
    nullable=False,
    default=0.0,
  )

  sous_total = Column(
    Float,
    nullable=False,
    default=0.0,
  )

  create_at = Column(
    DateTime,
    nullable=False,
    default=datetime.now,
  )

  update_at = Column(
    DateTime,
    nullable=False,
    default=datetime.now,
  )