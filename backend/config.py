import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "honeyguard-soc-secret-key-2026-defense-deception")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'honeyguard.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))
    
    # Detection Engine Tuning
    RAPID_ATTEMPT_WINDOW_SECONDS = int(os.environ.get("RAPID_ATTEMPT_WINDOW_SECONDS", 300))  # 5 minutes
    RAPID_ATTEMPT_THRESHOLD = int(os.environ.get("RAPID_ATTEMPT_THRESHOLD", 3))  # >=3 attempts => CRITICAL
    
    # App Information
    APP_NAME = "HONEYGUARD"
    APP_VERSION = "2.4.0"
    ENVIRONMENT = os.environ.get("FLASK_ENV", "development")
