from flask import Blueprint, request, make_response, jsonify
import csv
import io
from datetime import datetime
from database import db_session
from app.models.security_event import SecurityEvent
from app.models.alert import Alert
from app.models.honeytoken import Honeytoken

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("/export", methods=["GET"])
def export_csv():
    report_type = request.args.get("type", "events")  # events, alerts, honeytokens
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "alerts":
        writer.writerow(["Alert UUID", "Timestamp", "Title", "Severity", "Status", "Honeytoken", "Category", "Source IP", "Reviewed By", "Reviewed At"])
        alerts = db_session.query(Alert).order_by(Alert.timestamp.desc()).all()
        for a in alerts:
            d = a.to_dict()
            writer.writerow([
                d["alert_uuid"],
                d["timestamp"],
                d["title"],
                d["severity"],
                d["status"],
                d["token_name"],
                d["token_type"],
                d["source_ip"],
                d["reviewed_by"] or "N/A",
                d["reviewed_at"] or "N/A"
            ])
        filename = f"honeyguard_alerts_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    elif report_type == "honeytokens":
        writer.writerow(["Token ID", "Name", "Category", "Decoy Value", "Location Context", "Is Active", "Access Count", "Last Accessed", "Created At"])
        tokens = db_session.query(Honeytoken).order_by(Honeytoken.created_at.desc()).all()
        for t in tokens:
            writer.writerow([
                t.token_id,
                t.name,
                t.category,
                t.decoy_value,
                t.location_context,
                "YES" if t.is_active else "NO",
                t.access_count,
                t.last_accessed_at.isoformat() if t.last_accessed_at else "Never",
                t.created_at.isoformat() if t.created_at else "N/A"
            ])
        filename = f"honeyguard_tokens_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    else:  # default: events
        writer.writerow(["Event UUID", "Timestamp", "Honeytoken", "Category", "Source IP", "Event Type", "Severity", "Detection Rule", "Anomaly Score", "Status"])
        events = db_session.query(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).all()
        for e in events:
            writer.writerow([
                e.event_uuid,
                e.timestamp.isoformat() if e.timestamp else "",
                e.token_name,
                e.token_type,
                e.source_ip,
                e.event_type,
                e.severity,
                e.detection_rule,
                e.anomaly_score,
                e.status
            ])
        filename = f"honeyguard_security_events_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    response.headers["Content-Type"] = "text/csv; charset=utf-8"
    return response

@reports_bp.route("/summary", methods=["GET"])
def get_incident_summary_report():
    total_tokens = db_session.query(Honeytoken).count()
    total_events = db_session.query(SecurityEvent).count()
    critical_alerts = db_session.query(Alert).filter_by(severity="CRITICAL").all()
    active_alerts = db_session.query(Alert).filter_by(status="ACTIVE").all()

    return jsonify({
        "report_id": f"REP-{datetime.utcnow().strftime('%Y%m%d')}-001",
        "generated_at": datetime.utcnow().isoformat(),
        "organization": "Internal Threat Defense SOC",
        "system": "HONEYGUARD Deception Architecture",
        "executive_summary": {
            "total_tokens_deployed": total_tokens,
            "total_incidents_recorded": total_events,
            "critical_threats_count": len(critical_alerts),
            "unresolved_alerts_count": len(active_alerts),
            "deception_fidelity": "100% (Zero false-positive design)"
        },
        "critical_incidents": [a.to_dict() for a in critical_alerts],
        "active_alerts": [a.to_dict() for a in active_alerts]
    }), 200
