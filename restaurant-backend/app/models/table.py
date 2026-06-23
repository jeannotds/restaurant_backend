import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Table(Base):
  __tablename__ = "tables"

  id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
  )

  numero = Column(
    Integer,
    nullable=True,
  )

  capacity = Column(
    Integer,
    nullable=True,
  )

  places_occupees = Column(
    Integer,
    nullable=True,
    default=0,
  )

  status = Column(
    String(200),
    nullable=False,
    default="LIBRE",
  )

  code_acces = Column(
    String(50),
    nullable=True,
  )

  restaurant_id = Column(
    UUID(as_uuid=True),
    ForeignKey("restaurants.id"),
    nullable=False,
  )

  create_at = Column(
    DateTime,
    default=datetime.now,
    nullable=False,
  )

