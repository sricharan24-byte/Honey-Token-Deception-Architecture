from datetime import datetime, timedelta
from database import db_session
from app.models.honeytoken import Honeytoken
from app.models.security_event import SecurityEvent
from app.models.alert import Alert
from app.models.activity_log import ActivityLog
from app.utils.helpers import generate_event_id, generate_alert_id
from config import Config

class ThreatDetectionEngine:
    """
    HONEYGUARD Threat Detection & Deception Engine
    Analyzes decoy interactions, correlates events, determines threat severity,
    and issues real-time alerts with explainable deterministic rules.
    """

    @staticmethod
    def process_interaction(
        token_id_or_obj,
        source_ip: str,
        user_agent: str,
        event_type: str,
        payload_preview: str = None,
        force_critical: bool = False,
        simulated_actor: str = "Simulated Insider"
    ) -> dict:
        """
        Core detection entry point called whenever any decoy asset is touched.
        """
        # Resolve Honeytoken
        honeytoken = None
        if isinstance(token_id_or_obj, Honeytoken):
            honeytoken = token_id_or_obj
        elif isinstance(token_id_or_obj, int):
            honeytoken = db_session.query(Honeytoken).filter_by(id=token_id_or_obj).first()
        elif isinstance(token_id_or_obj, str):
            honeytoken = db_session.query(Honeytoken).filter(
                (Honeytoken.token_id == token_id_or_obj) |
                (Honeytoken.decoy_value == token_id_or_obj) |
                (Honeytoken.decoy_username == token_id_or_obj)
            ).first()

        now = datetime.utcnow()

        if honeytoken:
            token_id = honeytoken.id
            token_name = honeytoken.name
            token_category = honeytoken.category
            is_active = honeytoken.is_active

            # Increment access telemetry on the token
            honeytoken.access_count += 1
            honeytoken.last_accessed_at = now
        else:
            token_id = None
            token_name = "Unregistered Decoy Asset"
            token_category = "UNKNOWN"
            is_active = True

        # Sliding window check: Count recent events from the same source IP in the last window
        window_start = now - timedelta(seconds=Config.RAPID_ATTEMPT_WINDOW_SECONDS)
        recent_ip_events_count = db_session.query(SecurityEvent).filter(
            SecurityEvent.source_ip == source_ip,
            SecurityEvent.timestamp >= window_start
        ).count()

        # Deterministic Rule Evaluation
        detection_rule = ""
        severity = "HIGH"
        anomaly_score = 75.0
        explanation = ""

        # Case 1: Force critical (from Security Lab multiple attempt simulation) or burst threshold reached
        if force_critical or (recent_ip_events_count >= Config.RAPID_ATTEMPT_THRESHOLD):
            detection_rule = "RULE-201-BURST-CORRELATION"
            severity = "CRITICAL"
            anomaly_score = 98.5
            explanation = (
                f"Multi-vector insider threat detected! Source IP {source_ip} triggered "
                f"{recent_ip_events_count + 1} decoy interactions within {Config.RAPID_ATTEMPT_WINDOW_SECONDS}s. "
                "Active credential/reconnaissance harvesting campaign in progress."
            )
        # Case 2: Inactive or revoked token was touched
        elif not is_active:
            detection_rule = "RULE-202-INACTIVE-TOKEN-PROBE"
            severity = "MEDIUM"
            anomaly_score = 55.0
            explanation = (
                f"Probe detected on disabled/revoked honeytoken '{token_name}'. "
                "Indicates actor possesses stale exfiltrated data or is executing blind fuzzing."
            )
        # Case 3: Category-based active detection rules
        elif token_category == "EMPLOYEE_CREDENTIAL":
            detection_rule = "RULE-101-CREDENTIAL-DECOY"
            severity = "HIGH"
            anomaly_score = 88.0
            explanation = (
                f"Unauthorized credential stuffing or insider impersonation using decoy account '{token_name}'. "
                "Decoy credentials have no legitimate operational use."
            )
        elif token_category == "API_KEY":
            detection_rule = "RULE-102-API-KEY-EXFILTRATION"
            severity = "HIGH"
            anomaly_score = 90.0
            explanation = (
                f"Decoy API key '{token_name}' was ingested into an authorization header or API request. "
                "Points directly to source code scraping or secret leakage."
            )
        elif token_category == "DATABASE_CREDENTIAL":
            detection_rule = "RULE-103-DATABASE-CREDENTIAL-TAMPERING"
            severity = "HIGH"
            anomaly_score = 92.0
            explanation = (
                f"Direct query or connection attempt intercepted using decoy DB string '{token_name}'. "
                "Signals internal database reconnaissance or privilege escalation intent."
            )
        elif token_category == "DECOY_DOCUMENT":
            detection_rule = "RULE-104-CONFIDENTIAL-DOC-LEAK"
            severity = "HIGH"
            anomaly_score = 86.0
            explanation = (
                f"Unauthorized access/download of canary-tagged confidential document '{token_name}'. "
                "Clear indicator of intellectual property exfiltration."
            )
        elif token_category == "SENSITIVE_FILE":
            detection_rule = "RULE-105-SENSITIVE-FILE-INSPECTION"
            severity = "HIGH"
            anomaly_score = 84.0
            explanation = (
                f"File system exploration intercepted on sensitive decoy file '{token_name}'. "
                "Attacker is hunting for secrets in configuration files."
            )
        else:
            detection_rule = "RULE-100-CANARY-PROBE"
            severity = "LOW"
            anomaly_score = 40.0
            explanation = f"Generic interaction recorded on canary reference '{token_name}'."

        # Create Security Event
        event_uuid = generate_event_id()
        security_event = SecurityEvent(
            event_uuid=event_uuid,
            timestamp=now,
            honeytoken_id=token_id,
            token_name=token_name,
            token_type=token_category,
            source_ip=source_ip,
            user_agent=user_agent or "Simulated-Client/1.0",
            event_type=event_type,
            payload_preview=payload_preview or f"Interaction with decoy {token_name}",
            severity=severity,
            detection_rule=detection_rule,
            anomaly_score=anomaly_score,
            is_simulated=True,
            status="ALERTED"
        )
        db_session.add(security_event)
        db_session.flush()  # Populates security_event.id

        # Generate Alert
        alert_uuid = generate_alert_id()
        alert_title = f"[{severity}] Deception Breach: {token_name}"
        alert_desc = f"{explanation} Source IP: {source_ip} | Event: {event_type} | Rule: {detection_rule}"

        alert = Alert(
            alert_uuid=alert_uuid,
            timestamp=now,
            event_id=security_event.id,
            honeytoken_id=token_id,
            title=alert_title,
            description=alert_desc,
            severity=severity,
            status="ACTIVE"
        )
        db_session.add(alert)

        # Record Activity Log for full SOC audit trail
        activity_log = ActivityLog(
            timestamp=now,
            actor=simulated_actor,
            category="THREAT_DETECTION",
            action=f"TRAP_TRIGGERED:{event_type}",
            details=f"Honeytoken '{token_name}' accessed from {source_ip}. Rule fired: {detection_rule} ({severity}).",
            ip_address=source_ip,
            severity=severity,
            status="DETECTED"
        )
        db_session.add(activity_log)

        db_session.commit()

        return {
            "success": True,
            "event": security_event.to_dict(),
            "alert": alert.to_dict(),
            "rule": detection_rule,
            "explanation": explanation,
            "severity": severity,
            "anomaly_score": anomaly_score,
            "recent_ip_events": recent_ip_events_count + 1
        }
