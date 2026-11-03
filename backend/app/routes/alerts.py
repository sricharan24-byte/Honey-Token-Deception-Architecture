from flask import Blueprint, request, jsonify
from app.services.alert_service import AlertService

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")

@alerts_bp.route("", methods=["GET"])
def list_alerts():
    severity = request.args.get("severity")
    status = request.args.get("status")
    search = request.args.get("search")
    limit = int(request.args.get("limit", 100))

    alerts = AlertService.get_all(severity=severity, status=status, search=search, limit=limit)
    return jsonify({
        "success": True,
        "count": len(alerts),
        "data": alerts
    }), 200

@alerts_bp.route("/<int:alert_id>", methods=["GET"])
def get_alert(alert_id):
    alert = AlertService.get_by_id(alert_id)
    if not alert:
        return jsonify({"success": False, "message": "Alert not found"}), 404
    return jsonify({"success": True, "data": alert}), 200

@alerts_bp.route("/<int:alert_id>/review", methods=["PUT"])
def review_alert(alert_id):
    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "REVIEWED")
    reviewer = data.get("reviewer", "admin")
    notes = data.get("mitigation_notes", "")
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)

    res = AlertService.review(alert_id, new_status=new_status, reviewer=reviewer, notes=notes, client_ip=client_ip)
    return jsonify(res), 200 if res.get("success") else 404
