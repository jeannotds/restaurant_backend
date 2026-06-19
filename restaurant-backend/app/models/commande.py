
from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, DateTime, String, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Base
from app.core.database import Base


class Commande(Base):
  id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
  )

  table_id = Column(
    UUID(as_uuid=True),
    foreign_key="tables.id",
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
    default="EN_PREPARATION,",
  )

  montant_total = Column(
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

  update_at = Column(
    DateTime,
    nullable=False,
    default=datetime.now,
  )