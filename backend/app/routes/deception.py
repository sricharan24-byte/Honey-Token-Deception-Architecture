from flask import Blueprint, request, jsonify, send_file
import io
import secrets
from database import db_session
from app.models.honeytoken import Honeytoken
from app.detection.engine import ThreatDetectionEngine

deception_bp = Blueprint("deception", __name__, url_prefix="/api/deception")

@deception_bp.route("/assets", methods=["GET"])
def get_deception_assets():
    """Returns active decoy assets configured for the controlled simulation lab."""
    tokens = db_session.query(Honeytoken).filter_by(is_active=True).all()
    grouped = {
        "EMPLOYEE_CREDENTIAL": [],
        "API_KEY": [],
        "DATABASE_CREDENTIAL": [],
        "DECOY_DOCUMENT": [],
        "SENSITIVE_FILE": []
    }
    for t in tokens:
        if t.category in grouped:
            grouped[t.category].append(t.to_dict())

    return jsonify({
        "success": True,
        "assets": grouped
    }), 200

@deception_bp.route("/access", methods=["POST"])
def generic_deception_access():
    """Generic access endpoint for any decoy asset interaction."""
    data = request.get_json(silent=True) or {}
    token_id = data.get("token_id")
    event_type = data.get("event_type", "UNAUTHORIZED_DECOY_ACCESS")
    source_ip = data.get("source_ip") or request.headers.get("X-Forwarded-For", request.remote_addr or "10.10.4.150")
    user_agent = data.get("user_agent") or request.headers.get("User-Agent", "Internal-Client/2.0")
    payload = data.get("payload_preview", f"Interacted with token {token_id}")

    res = ThreatDetectionEngine.process_interaction(
        token_id_or_obj=token_id,
        source_ip=source_ip,
        user_agent=user_agent,
        event_type=event_type,
        payload_preview=payload,
        simulated_actor="Deception Lab User"
    )
    return jsonify(res), 200

@deception_bp.route("/login", methods=["POST"])
def simulate_decoy_login():
    """Simulates an authentication attempt against the fake employee intranet portal."""
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    source_ip = data.get("source_ip") or "10.10.4.102"
    user_agent = request.headers.get("User-Agent", "Mozilla/5.0 IntranetBrowser/4.0")

    # Match token
    token = db_session.query(Honeytoken).filter(
        (Honeytoken.category == "EMPLOYEE_CREDENTIAL") &
        ((Honeytoken.decoy_username == username) | (Honeytoken.decoy_value == username))
    ).first()

    payload_summary = f"Decoy Portal Login: user='{username}', password='{'*' * len(password)}'"

    detection_result = ThreatDetectionEngine.process_interaction(
        token_id_or_obj=token or username,
        source_ip=source_ip,
        user_agent=user_agent,
        event_type="DECOY_LOGIN_ATTEMPT",
        payload_preview=payload_summary,
        simulated_actor=f"Insider ({username})"
    )

    # Return simulated portal rejection response along with detection telemetry
    return jsonify({
        "portal_status": "AUTHENTICATION_FAILED",
        "portal_message": "Access Denied: Invalid credentials or account locked. Security incident logged.",
        "detection_telemetry": detection_result
    }), 200

@deception_bp.route("/api-gateway", methods=["GET", "POST"])
def simulate_decoy_api():
    """Simulates an API request using a decoy API Key."""
    api_key = request.headers.get("X-Honey-Key") or request.args.get("api_key")
    if not api_key and request.is_json:
        api_key = request.get_json(silent=True).get("api_key")

    api_key = api_key or "AKIA2V8N9EXAMPLE7482"
    source_ip = request.headers.get("X-Forwarded-For") or "192.168.10.14"
    user_agent = request.headers.get("User-Agent", "aws-cli/2.15 Python/3.11")

    token = db_session.query(Honeytoken).filter(
        (Honeytoken.category == "API_KEY") &
        (Honeytoken.decoy_value == api_key)
    ).first()

    detection_result = ThreatDetectionEngine.process_interaction(
        token_id_or_obj=token or api_key,
        source_ip=source_ip,
        user_agent=user_agent,
        event_type="API_KEY_CALL",
        payload_preview=f"API Call intercepted: Key='{api_key[:12]}...', Endpoint='/api/v1/cloud/export'",
        simulated_actor="Cloud API Client"
    )

    return jsonify({
        "gateway_response": {
            "error": "Forbidden",
            "code": 403,
            "message": "Key authentication failed or token revoked by security policy."
        },
        "detection_telemetry": detection_result
    }), 403

@deception_bp.route("/database-query", methods=["POST"])
def simulate_decoy_database():
    """Simulates unauthorized database query/probe with decoy DB credentials."""
    data = request.get_json(silent=True) or {}
    conn_string = data.get("connection_string", "")
    query_text = data.get("query", "SELECT * FROM confidential_records LIMIT 5")
    source_ip = data.get("source_ip") or "10.10.4.15"
    user_agent = "DBeaver-Client/23.3"

    token = db_session.query(Honeytoken).filter(
        (Honeytoken.category == "DATABASE_CREDENTIAL") &
        ((Honeytoken.decoy_value == conn_string) | (Honeytoken.decoy_username == data.get("username")))
    ).first()

    payload_summary = f"SQL Query Probe: '{query_text}' against connection '{conn_string[:30]}...'"

    detection_result = ThreatDetectionEngine.process_interaction(
        token_id_or_obj=token or conn_string,
        source_ip=source_ip,
        user_agent=user_agent,
        event_type="DATABASE_QUERY_ATTEMPT",
        payload_preview=payload_summary,
        simulated_actor="Database Explorer"
    )

    return jsonify({
        "db_response": {
            "status": "FATAL: password authentication failed for user",
            "rows_affected": 0,
            "execution_time_ms": 12
        },
        "detection_telemetry": detection_result
    }), 200

@deception_bp.route("/document/<path:doc_name>", methods=["GET"])
def simulate_decoy_document(doc_name):
    """Simulates an insider downloading/opening a fake confidential document."""
    source_ip = request.args.get("source_ip") or "10.10.1.77"
    user_agent = request.headers.get("User-Agent", "Mozilla/5.0 DocumentViewer/1.0")

    token = db_session.query(Honeytoken).filter(
        (Honeytoken.category == "DECOY_DOCUMENT") &
        ((Honeytoken.decoy_value == doc_name) | (Honeytoken.name.ilike(f"%{doc_name}%")))
    ).first()

    detection_result = ThreatDetectionEngine.process_interaction(
        token_id_or_obj=token or doc_name,
        source_ip=source_ip,
        user_agent=user_agent,
        event_type="DOCUMENT_DOWNLOAD",
        payload_preview=f"Decoy Document Exfiltration: '{doc_name}' accessed with canary tracking active.",
        simulated_actor="SharePoint Visitor"
    )

    # Generate a realistic PDF-like / text dummy file with watermark and canary banner
    file_content = (
        f"=====================================================================\n"
        f"                  *** RESTRICTED CONFIDENTIAL ***                   \n"
        f"=====================================================================\n\n"
        f"DOCUMENT TITLE: {doc_name}\n"
        f"SECURITY CLASSIFICATION: TOP SECRET // COMPANY CONFIDENTIAL\n"
        f"CANARY SERIAL NUMBER: CANARY-HONEYGUARD-{secrets.randbelow(899999) + 100000}\n"
        f"ACCESS TIMESTAMP: {detection_result['event']['timestamp']}\n"
        f"SOURCE IP LOGGED: {source_ip}\n\n"
        f"NOTICE: THIS DOCUMENT IS A DIGITAL HONEYTOKEN MANAGED BY HONEYGUARD SOC.\n"
        f"ANY INTERACTION WITH THIS ASSET GENERATES A REAL-TIME CRITICAL ALERT.\n"
        f"ALL ACTIONS HAVE BEEN RECORDED IN THE CORPORATE AUDIT TRAIL.\n"
        f"=====================================================================\n"
    )

    mem_file = io.BytesIO()
    mem_file.write(file_content.encode("utf-8"))
    mem_file.seek(0)

    # Return JSON with download indicator or direct attachment
    if request.args.get("format") == "download":
        return send_file(
            mem_file,
            as_attachment=True,
            download_name=doc_name if doc_name.endswith(('.pdf', '.txt', '.xlsx')) else f"{doc_name}.txt",
            mimetype="text/plain"
        )

    return jsonify({
        "success": True,
        "message": f"Document '{doc_name}' accessed. Canary beacon triggered.",
        "detection_telemetry": detection_result,
        "document_content_preview": file_content
    }), 200

@deception_bp.route("/sensitive-file", methods=["POST", "GET"])
def simulate_sensitive_file():
    """Simulates sensitive configuration file reading."""
    file_path = request.args.get("file_path") or (request.get_json(silent=True) or {}).get("file_path", "/var/www/.env.production.bak")
    source_ip = request.args.get("source_ip") or "192.168.1.104"
    user_agent = request.headers.get("User-Agent", "curl/7.88.1")

    token = db_session.query(Honeytoken).filter(
        (Honeytoken.category == "SENSITIVE_FILE") &
        (Honeytoken.decoy_value == file_path)
    ).first()

    detection_result = ThreatDetectionEngine.process_interaction(
        token_id_or_obj=token or file_path,
        source_ip=source_ip,
        user_agent=user_agent,
        event_type="SENSITIVE_FILE_PROBE",
        payload_preview=f"Directory traversal / read probe on sensitive decoy file '{file_path}'",
        simulated_actor="Web Scraper / Attacker"
    )

    return jsonify({
        "file_content_preview": "# PRODUCTION SECRETS (CANARY TRAP)\nAPP_ENV=production\nDATABASE_URL=postgres://canary_trap:H0ney@db.corp/prod\nJWT_SECRET=canary_sig_498184",
        "detection_telemetry": detection_result
    }), 200

# =====================================================================
# SECURITY LAB - 1-CLICK DEMONSTRATION SIMULATOR ENDPOINTS
# =====================================================================
@deception_bp.route("/simulate-attack", methods=["POST"])
def simulate_security_lab_attack():
    """
    Handles the 5 Demonstration Buttons from the Security Lab:
    1. simulate_fake_credential
    2. simulate_decoy_api_key
    3. simulate_fake_database
    4. simulate_confidential_file
    5. simulate_multiple_suspicious
    """
    data = request.get_json(silent=True) or {}
    attack_type = data.get("attack_type")

    # Pick matching token or fallback
    if attack_type == "simulate_fake_credential":
        token = db_session.query(Honeytoken).filter_by(category="EMPLOYEE_CREDENTIAL", is_active=True).first()
        res = ThreatDetectionEngine.process_interaction(
            token_id_or_obj=token,
            source_ip="10.10.4.105",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0",
            event_type="DECOY_LOGIN_ATTEMPT",
            payload_preview=f"Simulated employee login attempt: user='{token.decoy_username if token else 's.jenkins'}' with decoy password.",
            simulated_actor="Lab Insider Simulator"
        )
        return jsonify({
            "simulation_name": "Fake Credential Access Simulation",
            "status": "DETECTED",
            "message": "Simulated rogue employee attempted login with seeded decoy staff credentials.",
            "result": res
        }), 200

    elif attack_type == "simulate_decoy_api_key":
        token = db_session.query(Honeytoken).filter_by(category="API_KEY", is_active=True).first()
        res = ThreatDetectionEngine.process_interaction(
            token_id_or_obj=token,
            source_ip="192.168.10.22",
            user_agent="PostmanRuntime/7.35.0",
            event_type="API_KEY_CALL",
            payload_preview=f"Simulated API request with header 'Authorization: Bearer {token.decoy_value if token else 'AKIA2V8N9EXAMPLE7482'}'",
            simulated_actor="Lab Insider Simulator"
        )
        return jsonify({
            "simulation_name": "Decoy API Key Usage Simulation",
            "status": "DETECTED",
            "message": "Simulated developer tried invoking internal microservice with leaked canary API key.",
            "result": res
        }), 200

    elif attack_type == "simulate_fake_database":
        token = db_session.query(Honeytoken).filter_by(category="DATABASE_CREDENTIAL", is_active=True).first()
        res = ThreatDetectionEngine.process_interaction(
            token_id_or_obj=token,
            source_ip="10.10.4.19",
            user_agent="psql/15.2 (PostgreSQL client)",
            event_type="DATABASE_QUERY_ATTEMPT",
            payload_preview=f"Simulated SQL connection attempt: '{token.decoy_value[:35] if token else 'postgres://...'}'",
            simulated_actor="Lab Insider Simulator"
        )
        return jsonify({
            "simulation_name": "Fake Database Access Simulation",
            "status": "DETECTED",
            "message": "Simulated insider probed planted database connection string from internal network.",
            "result": res
        }), 200

    elif attack_type == "simulate_confidential_file":
        token = db_session.query(Honeytoken).filter_by(category="DECOY_DOCUMENT", is_active=True).first()
        res = ThreatDetectionEngine.process_interaction(
            token_id_or_obj=token,
            source_ip="10.10.1.80",
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X)",
            event_type="DOCUMENT_DOWNLOAD",
            payload_preview=f"Simulated file retrieval: '{token.decoy_value if token else 'M&A_Financial_Assessment_Confidential_Q4.pdf'}'",
            simulated_actor="Lab Insider Simulator"
        )
        return jsonify({
            "simulation_name": "Confidential File Access Simulation",
            "status": "DETECTED",
            "message": "Simulated corporate espionage actor exfiltrated decoy high-value PDF document.",
            "result": res
        }), 200

    elif attack_type == "simulate_multiple_suspicious":
        # Multi-attempt burst from same IP to trigger CRITICAL severity
        burst_ip = "10.10.9.99"
        tokens = db_session.query(Honeytoken).filter_by(is_active=True).limit(3).all()
        results = []
        for i, t in enumerate(tokens):
            r = ThreatDetectionEngine.process_interaction(
                token_id_or_obj=t,
                source_ip=burst_ip,
                user_agent="BurpSuitePro/2024.1",
                event_type="BURST_ATTACK_SEQUENCE",
                payload_preview=f"Rapid spray attack vector #{i+1} against decoy asset '{t.name}'",
                force_critical=(i >= 1),  # Escalate immediately to CRITICAL
                simulated_actor="Correlated Attack Simulator"
            )
            results.append(r)

        return jsonify({
            "simulation_name": "Multiple Suspicious Attempts (Burst Spray)",
            "status": "CRITICAL_DETECTED",
            "message": f"Simulated automated attack sequence triggered across 3 decoy vectors from {burst_ip}.",
            "burst_count": len(results),
            "final_severity": "CRITICAL",
            "rule_fired": "RULE-201-BURST-CORRELATION",
            "result": results[-1]
        }), 200

    return jsonify({"success": False, "message": f"Unknown attack type: {attack_type}"}), 400
