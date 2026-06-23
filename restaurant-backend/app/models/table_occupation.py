
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class  TableOccupation(Base):
  __tablename__ = "table_occupations"

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

  restaurant_id = Column(
    UUID(as_uuid=True),
    ForeignKey("restaurants.id"),
    nullable=False,
  )

  client_name = Column(
    String(100),
    nullable=True,
  )

  telephone = Column(
    String(20),
    nullable=True,
  )

  nombre_de_places = Column(
    Integer,
    nullable=False,
    default=0,
  )

  status = Column(
    String(20),
    nullable=False,
    default="ACTIVE",
  )

  ended_at = Column(
    DateTime, 
    nullable=True
  )  # utilisé dans end_occupation ligne 78

  create_at = Column(
    DateTime,
    default=datetime.now,
    nullable=False,
  )

  update_at = Column(
    DateTime,
    default=datetime.now,
    nullable=False,
  )