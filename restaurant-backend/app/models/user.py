import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(
      UUID(as_uuid=True),
      primary_key=True,
      default=uuid.uuid4,
    )

    nom = Column(
      String(100),
      nullable=False,

    )

    prenom = Column(
      String(250),
      nullable=True,
    )

    email = Column(
      String(250),
      nullable=True,
      unique=True,
    )

    telephone = Column(
      String(15),
      nullable=True,
      unique=True,
    )

    password = Column(
      String(250),
      nullable=False,
    )

    is_active = Column(
      Boolean,
      default=True,
    )

    restaurant_id = Column(
      UUID(as_uuid=True),
      ForeignKey("restaurants.id"),
      nullable=True,
    )

    # restaurant = relationship("User", back_populates="restaurant")
    restaurant = relationship("Restaurant", back_populates="users")

    create_at = Column(
      DateTime,
      default=datetime.now,
      nullable=False,
    )
  


