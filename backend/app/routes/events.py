from flask import Blueprint, request, jsonify
from database import db_session
from app.models.security_event import SecurityEvent

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

@events_bp.route("", methods=["GET"])
def list_events():
    category = request.args.get("category")
    severity = request.args.get("severity")
    search = request.args.get("search")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))

    query = db_session.query(SecurityEvent)

    if category and category.upper() != "ALL":
        query = query.filter(SecurityEvent.token_type == category.upper())
    if severity and severity.upper() != "ALL":
        query = query.filter(SecurityEvent.severity == severity.upper())
    if search:
        s = f"%{search}%"
        query = query.filter(
            (SecurityEvent.event_uuid.ilike(s)) |
            (SecurityEvent.token_name.ilike(s)) |
            (SecurityEvent.source_ip.ilike(s)) |
            (SecurityEvent.payload_preview.ilike(s)) |
            (SecurityEvent.detection_rule.ilike(s))
        )

    total = query.count()
    events = query.order_by(SecurityEvent.timestamp.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        "success": True,
        "total": total,
        "page": page,
        "per_page": per_page,
        "data": [e.to_dict() for e in events]
    }), 200

@events_bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id):
    evt = db_session.query(SecurityEvent).filter_by(id=event_id).first()
    if not evt:
        return jsonify({"success": False, "message": "Event not found"}), 404
    return jsonify({"success": True, "data": evt.to_dict()}), 200
