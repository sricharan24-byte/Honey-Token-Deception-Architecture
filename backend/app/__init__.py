import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db_session, init_db
from app.services.seed_service import seed_database

# Blueprints
from app.routes.auth import auth_bp
from app.routes.dashboard import dashboard_bp
from app.routes.honeytokens import honeytokens_bp
from app.routes.deception import deception_bp
from app.routes.alerts import alerts_bp
from app.routes.events import events_bp
from app.routes.analytics import analytics_bp
from app.routes.reports import reports_bp
from app.routes.settings import settings_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend development
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database & Models
    init_db()
    seed_database()

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(honeytokens_bp)
    app.register_blueprint(deception_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(settings_bp)

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "API endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        db_session.rollback()
        return jsonify({"success": False, "message": "Internal server error", "error": str(e)}), 500

    @app.route("/")
    def index():
        return jsonify({
            "name": Config.APP_NAME,
            "version": Config.APP_VERSION,
            "status": "ARMED_AND_OPERATIONAL",
            "documentation": "/api/settings",
            "api_prefix": "/api"
        })

    return app
