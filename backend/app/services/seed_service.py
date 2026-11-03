from datetime import datetime, timedelta
from database import db_session
from app.models.user import User
from app.models.honeytoken import Honeytoken
from app.models.security_event import SecurityEvent
from app.models.alert import Alert
from app.models.activity_log import ActivityLog
from app.models.system_settings import SystemSetting

SAMPLE_HONEYTOKENS = [
    {
        "token_id": "HT-2026-1001",
        "name": "Decoy Credential: Sarah Jenkins (Finance Director)",
        "category": "EMPLOYEE_CREDENTIAL",
        "decoy_username": "s.jenkins",
        "decoy_value": "s.jenkins@corp-internal.net",
        "decoy_secret": "Fin#2026!Sec99",
        "location_context": "Simulated Active Directory / Internal HR Directory (Finance Executive)",
        "description": "Seeded executive credentials planted in internal HR wiki to catch unauthorized staff harvesting.",
        "tags": "employee,finance,directory-trap",
        "access_count": 3
    },
    {
        "token_id": "HT-2026-1002",
        "name": "Decoy Credential: Marcus Sterling (Cloud Lead)",
        "category": "EMPLOYEE_CREDENTIAL",
        "decoy_username": "m.sterling",
        "decoy_value": "m.sterling@corp-internal.net",
        "decoy_secret": "Cloud#Adm!2026",
        "location_context": "Simulated Internal LDAP & DevOps Onboarding Portal",
        "description": "DevOps lead decoy login created to detect lateral movement across staging infrastructure.",
        "tags": "employee,devops,lateral-movement",
        "access_count": 4
    },
    {
        "token_id": "HT-2026-1003",
        "name": "AWS Production IAM Canary Key",
        "category": "API_KEY",
        "decoy_username": "svc-aws-sync",
        "decoy_value": "AKIA2V8N9EXAMPLE7482",
        "decoy_secret": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY26",
        "location_context": "Simulated Git repository commit history and developer wiki page",
        "description": "High-entropy decoy AWS credential monitored for exfiltration and external invocation.",
        "tags": "api-key,cloud,git-leak",
        "access_count": 2
    },
    {
        "token_id": "HT-2026-1004",
        "name": "GitHub Enterprise CI/CD Decoy Token",
        "category": "API_KEY",
        "decoy_username": "ci-builder-bot",
        "decoy_value": "ghp_decoy_9B87F3E2A109C4D5E6F78901234567",
        "decoy_secret": "ci_oauth_token_decoy_prod",
        "location_context": "Simulated Jenkins pipeline script sample and local developer bash history",
        "description": "Decoy GitHub token designed to detect secret scanners and pipeline eavesdroppers.",
        "tags": "api-key,cicd,pipeline",
        "access_count": 1
    },
    {
        "token_id": "HT-2026-1005",
        "name": "Decoy DB: PostgreSQL Analytics Replica",
        "category": "DATABASE_CREDENTIAL",
        "decoy_username": "pg_analytics_decoy",
        "decoy_value": "postgresql://pg_analytics_decoy:P@ssw0rd99!@internal-db-01.corp.net:5432/finance_dw",
        "decoy_secret": "P@ssw0rd99!",
        "location_context": "Simulated internal BI dashboard database connection snippet",
        "description": "Planted database connection string in documentation to detect internal SQL probe attempts.",
        "tags": "database,postgres,analytics",
        "access_count": 3
    },
    {
        "token_id": "HT-2026-1006",
        "name": "Decoy DB: MongoDB Master Customer Archive",
        "category": "DATABASE_CREDENTIAL",
        "decoy_username": "mongo_decoy_admin",
        "decoy_value": "mongodb://mongo_decoy_admin:VaultK3y!2026@cluster0.db.internal:27017/customers_prod",
        "decoy_secret": "VaultK3y!2026",
        "location_context": "Simulated Docker compose environment template on shared dev share",
        "description": "Decoy NoSQL cluster admin credential to monitor unauthorized database enumeration.",
        "tags": "database,mongodb,nosql",
        "access_count": 0
    },
    {
        "token_id": "HT-2026-1007",
        "name": "Decoy Document: M&A_Financial_Assessment_Confidential_Q4.pdf",
        "category": "DECOY_DOCUMENT",
        "decoy_username": "cfo-office@corp.net",
        "decoy_value": "M&A_Financial_Assessment_Confidential_Q4.pdf",
        "decoy_secret": "CANARY_SIG_MNA_98213",
        "location_context": "Simulated corporate network file share `//corp-fs01/Executive_Confidential/`",
        "description": "High-value bait document with unique tracking canary to detect insider trade or file exfiltration.",
        "tags": "document,finance,insider-theft",
        "access_count": 2
    },
    {
        "token_id": "HT-2026-1008",
        "name": "Decoy Document: Executive_Salary_and_Bonus_Matrix_2026.xlsx",
        "category": "DECOY_DOCUMENT",
        "decoy_username": "hr-compensation@corp.net",
        "decoy_value": "Executive_Salary_and_Bonus_Matrix_2026.xlsx",
        "decoy_secret": "CANARY_SIG_PAYROLL_4401",
        "location_context": "Simulated HR SharePoint Portal `Shared Documents/Leadership Compensation/`",
        "description": "Decoy payroll spreadsheet designed to identify snooping employees searching for executive compensation.",
        "tags": "document,hr,compensation",
        "access_count": 1
    },
    {
        "token_id": "HT-2026-1009",
        "name": "Decoy File: /var/www/.env.production.bak",
        "category": "SENSITIVE_FILE",
        "decoy_username": "root/www-data",
        "decoy_value": "/var/www/.env.production.bak",
        "decoy_secret": "CANARY_HASH_ENV_8832",
        "location_context": "Simulated Linux web application root directory",
        "description": "Decoy backup configuration file containing fake cryptographic secrets to trap directory traversal.",
        "tags": "sensitive-file,web,directory-traversal",
        "access_count": 2
    },
    {
        "token_id": "HT-2026-1010",
        "name": "Decoy File: ~/.aws/credentials.old",
        "category": "SENSITIVE_FILE",
        "decoy_username": "developer",
        "decoy_value": "~/.aws/credentials.old",
        "decoy_secret": "CANARY_SIG_AWSCLI_119",
        "location_context": "Simulated engineer workstation home folder `C:\\Users\\dev\\.aws\\credentials.old`",
        "description": "Stale credentials decoy placed in common user profile directory to detect post-exploitation searching.",
        "tags": "sensitive-file,aws,workstation",
        "access_count": 1
    }
]

def seed_database():
    now = datetime.utcnow()

    # 1. Ensure Admin User exists
    admin = db_session.query(User).filter_by(username="admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@honeyguard.sec",
            role="ADMIN",
            is_active=True,
            created_at=now - timedelta(days=30),
            last_login=now
        )
        admin.set_password("HoneyGuard2026!")
        db_session.add(admin)
        db_session.commit()

    # 2. Check Honeytokens
    if db_session.query(Honeytoken).count() == 0:
        token_objs = []
        for i, token_data in enumerate(SAMPLE_HONEYTOKENS):
            ht = Honeytoken(
                token_id=token_data["token_id"],
                name=token_data["name"],
                category=token_data["category"],
                decoy_username=token_data["decoy_username"],
                decoy_value=token_data["decoy_value"],
                decoy_secret=token_data["decoy_secret"],
                location_context=token_data["location_context"],
                description=token_data["description"],
                is_active=True,
                access_count=token_data["access_count"],
                last_accessed_at=now - timedelta(hours=i * 5 + 2),
                tags=token_data["tags"],
                created_at=now - timedelta(days=14 - i)
            )
            token_objs.append(ht)
            db_session.add(ht)
        db_session.commit()

        # 3. Create 15 Sample Security Events
        tokens = db_session.query(Honeytoken).all()
        token_map = {t.token_id: t for t in tokens}

        sample_event_defs = [
            ("HT-2026-1001", "10.10.4.102", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "DECOY_LOGIN_ATTEMPT", "User auth attempt: s.jenkins / Fin#2026!Sec99", "HIGH", "RULE-101-CREDENTIAL-DECOY", 88.0, 36),
            ("HT-2026-1002", "10.10.2.88", "curl/8.2.1", "DECOY_LOGIN_ATTEMPT", "LDAP bind attempt: m.sterling", "HIGH", "RULE-101-CREDENTIAL-DECOY", 88.0, 32),
            ("HT-2026-1002", "10.10.2.88", "python-requests/2.31.0", "RAPID_PROBE_ATTEMPT", "Second consecutive authentication attempt for m.sterling", "HIGH", "RULE-101-CREDENTIAL-DECOY", 91.0, 31),
            ("HT-2026-1002", "10.10.2.88", "python-requests/2.31.0", "BURST_BRUTE_FORCE", "Third rapid authentication attempt - threshold exceeded", "CRITICAL", "RULE-201-BURST-CORRELATION", 99.0, 30),
            ("HT-2026-1003", "192.168.10.14", "aws-cli/2.15.15 Python/3.11.6", "API_KEY_CALL", "AWS sts:GetCallerIdentity request using AKIA2V8N9EXAMPLE7482", "HIGH", "RULE-102-API-KEY-EXFILTRATION", 90.0, 24),
            ("HT-2026-1003", "192.168.10.14", "aws-cli/2.15.15 Python/3.11.6", "API_KEY_CALL", "AWS s3:ListBuckets request using AKIA2V8N9EXAMPLE7482", "HIGH", "RULE-102-API-KEY-EXFILTRATION", 92.0, 23),
            ("HT-2026-1004", "172.16.5.42", "git/2.43.0", "API_KEY_CALL", "Git clone authenticated via ghp_decoy_9B87F3E2...", "HIGH", "RULE-102-API-KEY-EXFILTRATION", 89.0, 18),
            ("HT-2026-1005", "10.10.4.15", "DBeaver 23.3.0", "DATABASE_QUERY_ATTEMPT", "SELECT * FROM finance_dw.quarterly_rev LIMIT 10", "HIGH", "RULE-103-DATABASE-CREDENTIAL-TAMPERING", 92.0, 14),
            ("HT-2026-1005", "10.10.4.15", "DBeaver 23.3.0", "DATABASE_QUERY_ATTEMPT", "SHOW TABLES IN finance_dw schema", "HIGH", "RULE-103-DATABASE-CREDENTIAL-TAMPERING", 93.0, 13),
            ("HT-2026-1005", "10.10.4.15", "DBeaver 23.3.0", "BURST_DATABASE_PROBE", "Correlated DB enumeration burst detected from 10.10.4.15", "CRITICAL", "RULE-201-BURST-CORRELATION", 98.0, 12),
            ("HT-2026-1007", "10.10.1.77", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "DOCUMENT_DOWNLOAD", "File download GET request: M&A_Financial_Assessment_Confidential_Q4.pdf", "HIGH", "RULE-104-CONFIDENTIAL-DOC-LEAK", 86.0, 9),
            ("HT-2026-1007", "10.10.1.77", "Adobe Acrobat Pro/24.1", "DOCUMENT_OPEN", "Canary web-beacon beaconed back on document open", "HIGH", "RULE-104-CONFIDENTIAL-DOC-LEAK", 87.0, 8),
            ("HT-2026-1008", "10.10.3.50", "Microsoft Office Excel 2024", "DOCUMENT_ACCESS", "Canary macro triggered in Executive_Salary_and_Bonus_Matrix_2026.xlsx", "HIGH", "RULE-104-CONFIDENTIAL-DOC-LEAK", 85.0, 5),
            ("HT-2026-1009", "192.168.1.104", "curl/7.88.1", "SENSITIVE_FILE_PROBE", "HTTP GET /var/www/.env.production.bak traversal probe", "HIGH", "RULE-105-SENSITIVE-FILE-INSPECTION", 84.0, 3),
            ("HT-2026-1010", "10.10.2.19", "PowerShell/7.4.0", "SENSITIVE_FILE_PROBE", "Get-Content ~/.aws/credentials.old command executed", "MEDIUM", "RULE-105-SENSITIVE-FILE-INSPECTION", 70.0, 1)
        ]

        created_events = []
        for i, (t_id, ip, ua, etype, payload, sev, rule, score, hrs_ago) in enumerate(sample_event_defs):
            t_obj = token_map.get(t_id)
            evt = SecurityEvent(
                event_uuid=f"EVT-2026-DEMO-{1000 + i}",
                timestamp=now - timedelta(hours=hrs_ago),
                honeytoken_id=t_obj.id if t_obj else None,
                token_name=t_obj.name if t_obj else "Simulated Decoy",
                token_type=t_obj.category if t_obj else "DECOY",
                source_ip=ip,
                user_agent=ua,
                event_type=etype,
                payload_preview=payload,
                severity=sev,
                detection_rule=rule,
                anomaly_score=score,
                is_simulated=True,
                status="ALERTED"
            )
            created_events.append(evt)
            db_session.add(evt)
        db_session.commit()

        # 4. Create 8 Sample Alerts linked to the most significant events
        alert_defs = [
            (created_events[3], "CRITICAL", "ACTIVE", "Multi-Vector Credential Spraying Detected", "CRITICAL alert: Host 10.10.2.88 executed rapid brute-force credential stuffing against decoy DevOps lead identity."),
            (created_events[9], "CRITICAL", "ACTIVE", "Active Reconnaissance on Decoy Database", "CRITICAL alert: Host 10.10.4.15 performed multiple unauthorized metadata and schema probes against internal decoy database."),
            (created_events[0], "HIGH", "ACTIVE", "Unauthorized Decoy Executive Credential Usage", "HIGH alert: Authentication attempted for fake executive Sarah Jenkins from insider IP 10.10.4.102."),
            (created_events[4], "HIGH", "REVIEWED", "Exfiltrated AWS Canary API Key Invocation", "HIGH alert: Decoy AWS IAM credential used to query STS GetCallerIdentity from workstation 192.168.10.14."),
            (created_events[6], "HIGH", "REVIEWED", "Decoy GitHub Token Exfiltration Detected", "HIGH alert: Decoy GitHub Enterprise token used to initiate Git clone operation from 172.16.5.42."),
            (created_events[10], "HIGH", "ACTIVE", "Restricted M&A Document Exfiltrated", "HIGH alert: Download of confidential M&A financial assessment document detected from internal IP 10.10.1.77."),
            (created_events[12], "HIGH", "RESOLVED", "Executive Payroll Spreadsheet Canary Triggered", "HIGH alert: Snooping employee opened seeded executive salary workbook on HR SharePoint."),
            (created_events[14], "MEDIUM", "RESOLVED", "Workstation Credential Hunting Observed", "MEDIUM alert: PowerShell script accessed legacy AWS credentials decoy file on internal workstation 10.10.2.19.")
        ]

        for i, (evt, sev, status, title, desc) in enumerate(alert_defs):
            alt = Alert(
                alert_uuid=f"ALT-2026-DEMO-{4000 + i}",
                timestamp=evt.timestamp + timedelta(seconds=2),
                event_id=evt.id,
                honeytoken_id=evt.honeytoken_id,
                title=f"[{sev}] {title}",
                description=desc,
                severity=sev,
                status=status,
                reviewed_by="admin" if status != "ACTIVE" else None,
                reviewed_at=now - timedelta(hours=2) if status != "ACTIVE" else None,
                mitigation_notes="Host workstation isolated for forensic inspection." if status == "RESOLVED" else None
            )
            db_session.add(alt)

        # 5. Populate initial Activity Logs
        for i in range(10):
            log = ActivityLog(
                timestamp=now - timedelta(hours=i * 3 + 1),
                actor="HoneyGuard-DetectionEngine",
                category="DETECTION",
                action="TRAP_TRIGGERED",
                details=f"Automated threat detection rule validated for incident #{i+1}.",
                ip_address=f"10.10.{(i % 4) + 1}.{10 + i * 7}",
                severity="HIGH" if i < 4 else "INFO",
                status="DETECTED"
            )
            db_session.add(log)

        # 6. Set System Settings defaults
        settings = [
            ("system_status", "ONLINE_ARMED", "Operational state of the Honeyguard detection agent"),
            ("rapid_attempt_threshold", "3", "Number of attempts within window to escalate to CRITICAL"),
            ("rapid_attempt_window_sec", "300", "Sliding correlation window for burst detection"),
            ("real_time_notifications", "ENABLED", "Push alerts to security operations console")
        ]
        for k, v, d in settings:
            s = SystemSetting(key=k, value=v, description=d)
            db_session.add(s)

        db_session.commit()

def reset_demonstration_data():
    """Wipes all mutable data and re-seeds the pristine 10 tokens, 15 events, 8 alerts."""
    db_session.query(Alert).delete()
    db_session.query(SecurityEvent).delete()
    db_session.query(Honeytoken).delete()
    db_session.query(ActivityLog).delete()
    db_session.query(SystemSetting).delete()
    db_session.commit()
    seed_database()
    return {"success": True, "message": "Demonstration data successfully reset to original state"}
