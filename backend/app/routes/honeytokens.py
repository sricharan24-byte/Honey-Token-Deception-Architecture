from flask import Blueprint, request, jsonify
from app.services.honeytoken_service import HoneytokenService
from app.utils.helpers import generate_decoy_asset

honeytokens_bp = Blueprint("honeytokens", __name__, url_prefix="/api/honeytokens")

@honeytokens_bp.route("", methods=["GET"])
def list_honeytokens():
    category = request.args.get("category")
    is_active_param = request.args.get("is_active")
    search = request.args.get("search")

    is_active = None
    if is_active_param is not None:
        is_active = is_active_param.lower() in ["true", "1"]

    tokens = HoneytokenService.get_all(category=category, is_active=is_active, search=search)
    return jsonify({
        "success": True,
        "count": len(tokens),
        "data": tokens
    }), 200

@honeytokens_bp.route("/<int:token_id>", methods=["GET"])
def get_honeytoken(token_id):
    token = HoneytokenService.get_by_id(token_id)
    if not token:
        return jsonify({"success": False, "message": "Honeytoken not found"}), 404
    return jsonify({"success": True, "data": token}), 200

@honeytokens_bp.route("", methods=["POST"])
def create_honeytoken():
    data = request.get_json(silent=True) or {}
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    res = HoneytokenService.create(data, actor="admin", client_ip=client_ip)
    return jsonify(res), 201 if res.get("success") else 400

@honeytokens_bp.route("/<int:token_id>", methods=["PUT"])
def update_honeytoken(token_id):
    data = request.get_json(silent=True) or {}
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    res = HoneytokenService.update(token_id, data, actor="admin", client_ip=client_ip)
    return jsonify(res), 200 if res.get("success") else 404

@honeytokens_bp.route("/<int:token_id>", methods=["DELETE"])
def delete_honeytoken(token_id):
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    res = HoneytokenService.delete(token_id, actor="admin", client_ip=client_ip)
    return jsonify(res), 200 if res.get("success") else 404

@honeytokens_bp.route("/<int:token_id>/history", methods=["GET"])
def get_token_history(token_id):
    history = HoneytokenService.get_history(token_id)
    return jsonify({
        "success": True,
        "count": len(history),
        "data": history
    }), 200

@honeytokens_bp.route("/generate-preview", methods=["GET"])
def generate_preview():
    category = request.args.get("category", "EMPLOYEE_CREDENTIAL")
    decoy = generate_decoy_asset(category)
    return jsonify({
        "success": True,
        "data": decoy
    }), 200
