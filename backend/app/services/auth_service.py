from datetime import datetime
from functools import wraps
from flask import request, jsonify
from database import db_session
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.utils.helpers import create_auth_token, verify_auth_token

class AuthService:
    @staticmethod
    def authenticate(email_or_username: str, password: str, client_ip: str = "127.0.0.1") -> dict:
        user = db_session.query(User).filter(
            (User.email == email_or_username.lower().strip()) |
            (User.username == email_or_username.strip())
        ).first()

        if not user or not user.check_password(password):
            # Log failed authentication
            log = ActivityLog(
                actor=email_or_username,
                category="AUTH",
                action="LOGIN_FAILED",
                details=f"Failed login attempt for user identifier: {email_or_username}",
                ip_address=client_ip,
                severity="MEDIUM",
                status="BLOCKED"
            )
            db_session.add(log)
            db_session.commit()
            return {"success": False, "message": "Invalid email/username or password"}

        if not user.is_active:
            return {"success": False, "message": "User account is suspended"}

        # Update last login
        user.last_login = datetime.utcnow()
        token = create_auth_token(user.id, user.username, user.role)

        # Log successful auth
        log = ActivityLog(
            actor=user.username,
            category="AUTH",
            action="LOGIN_SUCCESS",
            details=f"Admin {user.username} authenticated successfully.",
            ip_address=client_ip,
            severity="INFO",
            status="SUCCESS"
        )
        db_session.add(log)
        db_session.commit()

        return {
            "success": True,
            "token": token,
            "user": user.to_dict()
        }

    @staticmethod
    def change_password(user_id: int, old_pwd: str, new_pwd: str, client_ip: str = "127.0.0.1") -> dict:
        user = db_session.query(User).filter_by(id=user_id).first()
        if not user:
            return {"success": False, "message": "User not found"}
        if not user.check_password(old_pwd):
            return {"success": False, "message": "Current password is incorrect"}
        if len(new_pwd) < 8:
            return {"success": False, "message": "New password must be at least 8 characters"}

        user.set_password(new_pwd)
        log = ActivityLog(
            actor=user.username,
            category="AUTH",
            action="PASSWORD_CHANGED",
            details="User updated administrative password.",
            ip_address=client_ip,
            severity="INFO",
            status="SUCCESS"
        )
        db_session.add(log)
        db_session.commit()
        return {"success": True, "message": "Password updated successfully"}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authorization header missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"success": False, "message": "Invalid token format (Bearer required)"}), 401

        payload = verify_auth_token(parts[1])
        if not payload:
            return jsonify({"success": False, "message": "Token expired or invalid"}), 401

        request.current_user = payload
        return f(*args, **kwargs)
    return decorated
