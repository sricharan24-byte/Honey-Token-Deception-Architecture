import os
from flask import Blueprint, request, jsonify
from database import db_session, engine
from app.models.honeytoken import Honeytoken
from app.models.security_event import SecurityEvent
from app.models.alert import Alert
from app.models.user import User
from app.services.seed_service import reset_demonstration_data
from config import Config

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")

@settings_bp.route("", methods=["GET"])
def get_settings():
    db_file = Config.BASE_DIR / "honeyguard.db"
    db_size_kb = 0
    if os.path.exists(db_file):
        db_size_kb = round(os.path.getsize(db_file) / 1024, 2)

    return jsonify({
        "success": True,
        "app_info": {
            "name": Config.APP_NAME,
            "version": Config.APP_VERSION,
            "environment": Config.ENVIRONMENT,
            "architecture": "Deception-First Internal Threat Detection Engine",
            "database_type": "SQLite with SQLAlchemy ORM",
            "database_size_kb": db_size_kb
        },
        "detection_config": {
            "rapid_attempt_window_seconds": Config.RAPID_ATTEMPT_WINDOW_SECONDS,
            "rapid_attempt_threshold": Config.RAPID_ATTEMPT_THRESHOLD,
            "deterministic_rules_count": 7,
            "severity_levels": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        },
        "database_counts": {
            "users": db_session.query(User).count(),
            "honeytokens": db_session.query(Honeytoken).count(),
            "security_events": db_session.query(SecurityEvent).count(),
            "alerts": db_session.query(Alert).count()
        }
    }), 200

@settings_bp.route("/reset-demo", methods=["POST"])
def reset_demo():
    res = reset_demonstration_data()
    return jsonify(res), 200

@settings_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "HEALTHY",
        "service": "Honeyguard Backend",
        "database": "CONNECTED",
        "detection_engine": "ACTIVE"
    }), 200
