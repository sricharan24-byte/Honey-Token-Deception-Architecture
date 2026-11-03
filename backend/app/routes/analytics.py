from flask import Blueprint, jsonify
from app.services.analytics_service import AnalyticsService

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("", methods=["GET"])
def get_analytics():
    data = AnalyticsService.get_dashboard_stats()
    return jsonify({
        "success": True,
        "analytics": data
    }), 200
