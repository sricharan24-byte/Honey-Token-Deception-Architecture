from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    actor = Column(String(64), default="system", nullable=False)
    category = Column(String(64), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)
    details = Column(Text, nullable=False)
    ip_address = Column(String(64), default="127.0.0.1", nullable=False)
    severity = Column(String(32), default="INFO", nullable=False)
    status = Column(String(32), default="SUCCESS", nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "actor": self.actor,
            "category": self.category,
            "action": self.action,
            "details": self.details,
            "ip_address": self.ip_address,
            "severity": self.severity,
            "status": self.status
        }
