from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email_or_user = data.get("email") or data.get("username")
    password = data.get("password")

    if not email_or_user or not password:
        return jsonify({"success": False, "message": "Email/Username and Password are required"}), 400

    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    res = AuthService.authenticate(email_or_user, password, client_ip)
    status_code = 200 if res.get("success") else 401
    return jsonify(res), status_code

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    user_payload = getattr(request, "current_user", {})
    return jsonify({
        "success": True,
        "user": {
            "id": user_payload.get("sub"),
            "username": user_payload.get("username"),
            "role": user_payload.get("role")
        }
    })

@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password():
    data = request.get_json(silent=True) or {}
    old_pwd = data.get("current_password")
    new_pwd = data.get("new_password")
    user_payload = getattr(request, "current_user", {})

    if not old_pwd or not new_pwd:
        return jsonify({"success": False, "message": "Current and new password are required"}), 400

    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    res = AuthService.change_password(user_payload.get("sub"), old_pwd, new_pwd, client_ip)
    return jsonify(res), 200 if res.get("success") else 400

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"success": True, "message": "Logged out successfully"}), 200
