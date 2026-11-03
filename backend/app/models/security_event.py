from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_uuid = Column(String(64), unique=True, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    honeytoken_id = Column(Integer, ForeignKey("honeytokens.id"), nullable=True, index=True)
    token_name = Column(String(128), nullable=False)
    token_type = Column(String(64), nullable=False, index=True)
    source_ip = Column(String(64), nullable=False, default="10.10.4.102", index=True)
    user_agent = Column(String(256), nullable=False, default="Internal-Audit-Client/1.0")
    event_type = Column(String(64), nullable=False, index=True)
    payload_preview = Column(Text, nullable=True)
    severity = Column(String(32), nullable=False, default="HIGH", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    detection_rule = Column(String(128), nullable=False)
    anomaly_score = Column(Float, default=85.0, nullable=False)
    is_simulated = Column(Boolean, default=True, nullable=False)
    status = Column(String(32), default="ALERTED", nullable=False)

    # Relationships
    honeytoken = relationship("Honeytoken", back_populates="events")
    alerts = relationship("Alert", back_populates="event", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "event_uuid": self.event_uuid,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "honeytoken_id": self.honeytoken_id,
            "token_name": self.token_name,
            "token_type": self.token_type,
            "source_ip": self.source_ip,
            "user_agent": self.user_agent,
            "event_type": self.event_type,
            "payload_preview": self.payload_preview,
            "severity": self.severity,
            "detection_rule": self.detection_rule,
            "anomaly_score": self.anomaly_score,
            "is_simulated": self.is_simulated,
            "status": self.status
        }
