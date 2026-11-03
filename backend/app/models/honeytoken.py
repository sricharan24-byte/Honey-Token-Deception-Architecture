from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base

class Honeytoken(Base):
    __tablename__ = "honeytokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token_id = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False, index=True)  # EMPLOYEE_CREDENTIAL, API_KEY, DATABASE_CREDENTIAL, DECOY_DOCUMENT, SENSITIVE_FILE
    decoy_username = Column(String(128), nullable=True)
    decoy_value = Column(String(256), nullable=False)  # The key, filename, or token string
    decoy_secret = Column(String(256), nullable=True)   # The password or secret key
    location_context = Column(String(256), nullable=False)  # Where decoy is placed/leaked
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    access_count = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)
    tags = Column(String(128), default="internal,decoy", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    events = relationship("SecurityEvent", back_populates="honeytoken", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="honeytoken", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "token_id": self.token_id,
            "name": self.name,
            "category": self.category,
            "decoy_username": self.decoy_username,
            "decoy_value": self.decoy_value,
            "decoy_secret": self.decoy_secret,
            "location_context": self.location_context,
            "description": self.description,
            "is_active": self.is_active,
            "access_count": self.access_count,
            "last_accessed_at": self.last_accessed_at.isoformat() if self.last_accessed_at else None,
            "tags": [t.strip() for t in self.tags.split(",")] if self.tags else [],
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
