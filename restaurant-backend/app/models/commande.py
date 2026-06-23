
from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, DateTime, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Commande(Base):
  __tablename__ = "commandes"

  id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
  )

  table_id = Column(
    UUID(as_uuid=True),
    ForeignKey("tables.id"),
    nullable=False,
  )

  numero_commande = Column(
    Integer,
    nullable=False,
    default=0,
  )

  statut = Column(
    String(100),
    nullable=False,
    default="EN_PREPARATION",
  )

  montant_total = Column(
    Float,
    nullable=False,
    default=0.0,
  )

  items = relationship("CommandeItem", back_populates="commande")

  occupation_id = Column(
    UUID(as_uuid=True),
    ForeignKey("table_occupations.id"),
    nullable=True,  # nullable au début pour anciennes commandes
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