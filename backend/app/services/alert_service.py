from datetime import datetime
from database import db_session
from app.models.alert import Alert
from app.models.activity_log import ActivityLog

class AlertService:
    @staticmethod
    def get_all(severity: str = None, status: str = None, search: str = None, limit: int = 100):
        query = db_session.query(Alert)
        if severity and severity.upper() != "ALL":
            query = query.filter(Alert.severity == severity.upper())
        if status and status.upper() != "ALL":
            query = query.filter(Alert.status == status.upper())
        if search:
            s = f"%{search}%"
            query = query.filter(
                (Alert.title.ilike(s)) |
                (Alert.description.ilike(s)) |
                (Alert.alert_uuid.ilike(s))
            )
        alerts = query.order_by(Alert.timestamp.desc()).limit(limit).all()
        return [a.to_dict() for a in alerts]

    @staticmethod
    def get_by_id(alert_id: int):
        alert = db_session.query(Alert).filter_by(id=alert_id).first()
        return alert.to_dict() if alert else None

    @staticmethod
    def review(alert_id: int, new_status: str = "REVIEWED", reviewer: str = "admin", notes: str = "", client_ip: str = "127.0.0.1") -> dict:
        alert = db_session.query(Alert).filter_by(id=alert_id).first()
        if not alert:
            return {"success": False, "message": "Alert not found"}

        alert.status = new_status.upper()
        alert.reviewed_by = reviewer
        alert.reviewed_at = datetime.utcnow()
        if notes:
            alert.mitigation_notes = notes

        log = ActivityLog(
            actor=reviewer,
            category="ALERT_TRIAGE",
            action=f"ALERT_{alert.status}",
            details=f"Alert {alert.alert_uuid} marked as {alert.status}. Notes: {notes or 'None'}",
            ip_address=client_ip,
            severity="INFO",
            status="SUCCESS"
        )
        db_session.add(log)
        db_session.commit()

        return {"success": True, "alert": alert.to_dict()}
