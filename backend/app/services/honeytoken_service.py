from datetime import datetime
from database import db_session
from app.models.honeytoken import Honeytoken
from app.models.security_event import SecurityEvent
from app.models.activity_log import ActivityLog
from app.utils.helpers import generate_token_id, generate_decoy_asset

class HoneytokenService:
    @staticmethod
    def get_all(category: str = None, is_active: bool = None, search: str = None):
        query = db_session.query(Honeytoken)
        if category and category.upper() != "ALL":
            query = query.filter(Honeytoken.category == category.upper())
        if is_active is not None:
            query = query.filter(Honeytoken.is_active == is_active)
        if search:
            s = f"%{search}%"
            query = query.filter(
                (Honeytoken.name.ilike(s)) |
                (Honeytoken.token_id.ilike(s)) |
                (Honeytoken.decoy_value.ilike(s)) |
                (Honeytoken.location_context.ilike(s))
            )
        return [t.to_dict() for t in query.order_by(Honeytoken.created_at.desc()).all()]

    @staticmethod
    def get_by_id(token_id: int):
        token = db_session.query(Honeytoken).filter_by(id=token_id).first()
        return token.to_dict() if token else None

    @staticmethod
    def create(data: dict, actor: str = "admin", client_ip: str = "127.0.0.1") -> dict:
        category = data.get("category", "EMPLOYEE_CREDENTIAL").upper()
        
        # If auto-generation requested or fields missing, fill from decoy generator
        if data.get("auto_generate") or not data.get("decoy_value"):
            decoy = generate_decoy_asset(category)
            name = data.get("name") or decoy["name"]
            decoy_value = decoy["decoy_value"]
            decoy_secret = decoy["decoy_secret"]
            decoy_username = decoy.get("decoy_username", "")
            location_context = data.get("location_context") or decoy["location_context"]
            description = data.get("description") or decoy["description"]
            tags = data.get("tags") or decoy["tags"]
        else:
            name = data.get("name", "Custom Decoy Asset")
            decoy_value = data.get("decoy_value", "")
            decoy_secret = data.get("decoy_secret", "")
            decoy_username = data.get("decoy_username", "")
            location_context = data.get("location_context", "Corporate Environment")
            description = data.get("description", "")
            tags = data.get("tags", "custom,decoy")

        new_token = Honeytoken(
            token_id=generate_token_id(),
            name=name,
            category=category,
            decoy_username=decoy_username,
            decoy_value=decoy_value,
            decoy_secret=decoy_secret,
            location_context=location_context,
            description=description,
            is_active=bool(data.get("is_active", True)),
            tags=tags,
            created_at=datetime.utcnow()
        )
        db_session.add(new_token)
        db_session.flush()

        log = ActivityLog(
            actor=actor,
            category="HONEYTOKEN_MGMT",
            action="CREATE_TOKEN",
            details=f"Created honeytoken '{name}' ({category}) with ID {new_token.token_id}.",
            ip_address=client_ip,
            severity="INFO",
            status="SUCCESS"
        )
        db_session.add(log)
        db_session.commit()

        return {"success": True, "honeytoken": new_token.to_dict()}

    @staticmethod
    def update(token_id: int, data: dict, actor: str = "admin", client_ip: str = "127.0.0.1") -> dict:
        token = db_session.query(Honeytoken).filter_by(id=token_id).first()
        if not token:
            return {"success": False, "message": "Honeytoken not found"}

        if "name" in data:
            token.name = data["name"]
        if "location_context" in data:
            token.location_context = data["location_context"]
        if "description" in data:
            token.description = data["description"]
        if "is_active" in data:
            token.is_active = bool(data["is_active"])
        if "tags" in data:
            token.tags = data["tags"] if isinstance(data["tags"], str) else ",".join(data["tags"])
        if "decoy_value" in data and data["decoy_value"]:
            token.decoy_value = data["decoy_value"]
        if "decoy_secret" in data and data["decoy_secret"]:
            token.decoy_secret = data["decoy_secret"]

        log = ActivityLog(
            actor=actor,
            category="HONEYTOKEN_MGMT",
            action="UPDATE_TOKEN",
            details=f"Updated metadata for honeytoken '{token.name}' ({token.token_id}). Active state: {token.is_active}.",
            ip_address=client_ip,
            severity="INFO",
            status="SUCCESS"
        )
        db_session.add(log)
        db_session.commit()

        return {"success": True, "honeytoken": token.to_dict()}

    @staticmethod
    def delete(token_id: int, actor: str = "admin", client_ip: str = "127.0.0.1") -> dict:
        token = db_session.query(Honeytoken).filter_by(id=token_id).first()
        if not token:
            return {"success": False, "message": "Honeytoken not found"}

        token_name = token.name
        token_code = token.token_id

        db_session.delete(token)
        log = ActivityLog(
            actor=actor,
            category="HONEYTOKEN_MGMT",
            action="DELETE_TOKEN",
            details=f"Deleted honeytoken '{token_name}' ({token_code}) and associated cascade references.",
            ip_address=client_ip,
            severity="MEDIUM",
            status="SUCCESS"
        )
        db_session.add(log)
        db_session.commit()

        return {"success": True, "message": f"Honeytoken {token_code} deleted successfully"}

    @staticmethod
    def get_history(token_id: int) -> list:
        events = db_session.query(SecurityEvent).filter_by(honeytoken_id=token_id).order_by(SecurityEvent.timestamp.desc()).all()
        return [e.to_dict() for e in events]
