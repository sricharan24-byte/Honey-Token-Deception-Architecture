from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_uuid = Column(String(64), unique=True, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("security_events.id"), nullable=True, index=True)
    honeytoken_id = Column(Integer, ForeignKey("honeytokens.id"), nullable=True, index=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), nullable=False, default="HIGH", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(32), default="ACTIVE", nullable=False, index=True)  # ACTIVE, REVIEWED, RESOLVED
    reviewed_by = Column(String(64), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    mitigation_notes = Column(Text, nullable=True)

    # Relationships
    event = relationship("SecurityEvent", back_populates="alerts")
    honeytoken = relationship("Honeytoken", back_populates="alerts")

    def to_dict(self):
        return {
            "id": self.id,
            "alert_uuid": self.alert_uuid,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "event_id": self.event_id,
            "honeytoken_id": self.honeytoken_id,
            "token_name": self.honeytoken.name if self.honeytoken else (self.event.token_name if self.event else "Unknown Decoy"),
            "token_type": self.honeytoken.category if self.honeytoken else (self.event.token_type if self.event else "N/A"),
            "source_ip": self.event.source_ip if self.event else "10.10.x.x",
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "status": self.status,
            "reviewed_by": self.reviewed_by,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "mitigation_notes": self.mitigation_notes,
            "event_details": self.event.to_dict() if self.event else None
        }
