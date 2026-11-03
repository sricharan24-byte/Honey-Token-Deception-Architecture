from flask import Blueprint, jsonify
from app.services.analytics_service import AnalyticsService

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
def get_dashboard_stats():
    data = AnalyticsService.get_dashboard_stats()
    return jsonify({
        "success": True,
        "data": data
    }), 200
