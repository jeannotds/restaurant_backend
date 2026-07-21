import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Restaurant(Base):
  __tablename__ = "restaurants"

  id = Column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
  )

  nom = Column(
    String(100),
    nullable=False,
  )

  adresse = Column(
    String(255),
    nullable=False,
  )

  telephone = Column(
    String(20),
    nullable=False,
  )

  created_at = Column(
    DateTime, default=datetime.now, nullable=False,
  )

  users = relationship("User", back_populates="restaurant")
