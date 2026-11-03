import os
import json
import base64
import hmac
import hashlib
import time
import secrets
import string
from datetime import datetime, timedelta
from config import Config

def generate_random_string(length=16, chars=string.ascii_letters + string.digits):
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_token_id() -> str:
    return f"HT-{datetime.utcnow().year}-{secrets.randbelow(8999) + 1000}"

def generate_event_id() -> str:
    return f"EVT-{datetime.utcnow().strftime('%y%m%d')}-{secrets.randbelow(89999) + 10000}"

def generate_alert_id() -> str:
    return f"ALT-{datetime.utcnow().strftime('%y%m%d')}-{secrets.randbelow(89999) + 10000}"

# Realistic Decoy Templates
DECOY_FIRST_NAMES = ["David", "Elena", "Marcus", "Sarah", "Jonathan", "Alicia", "Victor", "Clara"]
DECOY_LAST_NAMES = ["Vance", "Kovacs", "Sterling", "Holloway", "Cross", "Chen", "Sinclair", "Mercer"]
DECOY_DEPARTMENTS = ["Finance", "Legal", "Executive", "Engineering", "HR", "Cloud Infrastructure"]

def generate_decoy_asset(category: str) -> dict:
    cat = category.upper()
    if cat == "EMPLOYEE_CREDENTIAL":
        first = secrets.choice(DECOY_FIRST_NAMES)
        last = secrets.choice(DECOY_LAST_NAMES)
        dept = secrets.choice(DECOY_DEPARTMENTS)
        username = f"{first[0].lower()}.{last.lower()}"
        pwd_symbols = "!@#$%^&*"
        pwd = f"{first[:3]}#{secrets.choice(string.digits)}{secrets.choice(string.digits)}!{generate_random_string(6)}"
        return {
            "name": f"Decoy Credential: {first} {last} ({dept})",
            "category": "EMPLOYEE_CREDENTIAL",
            "decoy_username": username,
            "decoy_value": f"{username}@corp-internal.net",
            "decoy_secret": pwd,
            "location_context": f"Simulated Active Directory / Internal HR Wiki ({dept} Staff Directory)",
            "description": f"Decoy staff credentials for insider trap placed in internal {dept} personnel directory.",
            "tags": "employee,insider-threat,directory-trap"
        }
    elif cat == "API_KEY":
        formats = [
            ("AWS IAM Decoy", f"AKIA{generate_random_string(16, string.ascii_uppercase + string.digits)}", generate_random_string(40)),
            ("GitHub Enterprise Token", f"ghp_decoy_{generate_random_string(30)}", "oauth_secret_decoy"),
            ("Production API Gateway Key", f"hg_live_{generate_random_string(32)}", "client_secret_live"),
            ("Stripe Decoy Key", f"sk_live_decoy_{generate_random_string(24)}", "restricted_webhook_sec")
        ]
        choice = secrets.choice(formats)
        return {
            "name": f"{choice[0]} Decoy",
            "category": "API_KEY",
            "decoy_username": "service-account-cloud-sync",
            "decoy_value": choice[1],
            "decoy_secret": choice[2],
            "location_context": "Simulated developer repository `.env.example` & public Slack channel transcript",
            "description": "High-entropy decoy cloud API key placed in accessible code comments and build configs.",
            "tags": "api-key,cloud,code-leak"
        }
    elif cat == "DATABASE_CREDENTIAL":
        db_types = [
            ("PostgreSQL Analytics Replica", "postgres", 5432, "pg_repl_decoy", "prod_bi_dw"),
            ("MySQL Customer DB Readonly", "mysql", 3306, "app_readonly_decoy", "customer_prod"),
            ("MongoDB Audit Store", "mongodb", 27017, "audit_viewer", "audit_log_2026")
        ]
        db = secrets.choice(db_types)
        pwd = f"DbSec!{generate_random_string(8)}#26"
        conn_str = f"{db[1]}://{db[3]}:{pwd}@internal-db-0{secrets.randbelow(4)+1}.corp.net:{db[2]}/{db[4]}"
        return {
            "name": f"Decoy DB: {db[0]}",
            "category": "DATABASE_CREDENTIAL",
            "decoy_username": db[3],
            "decoy_value": conn_str,
            "decoy_secret": pwd,
            "location_context": "Simulated database backup configuration script on file share",
            "description": "Decoy connection string planted in internal documentation and migration notes.",
            "tags": "database,sql,infrastructure"
        }
    elif cat == "DECOY_DOCUMENT":
        docs = [
            ("M&A_Financial_Assessment_Confidential_Q4.pdf", "Mergers & Acquisitions Board Presentation with fake valuation numbers", "Finance / Shared Drive `//corp-fs01/Board_Confidential/`"),
            ("Executive_Salary_and_Bonus_Matrix_2026.xlsx", "Sensitive payroll breakdown decoy workbook with canary tracking", "HR SharePoint `Executive Compensation/`"),
            ("ZeroDay_Vulnerability_Disclosure_Internal.pdf", "Security vulnerability report decoy to catch snooping engineers", "Internal Security Confluence Space"),
            ("Client_CreditCard_Retention_Audit.csv", "Masked decoy customer transaction database", "Cloud S3 Bucket `corp-billing-archives-decoy`")
        ]
        doc = secrets.choice(docs)
        return {
            "name": f"Decoy Document: {doc[0]}",
            "category": "DECOY_DOCUMENT",
            "decoy_username": "document-owner@corp.net",
            "decoy_value": doc[0],
            "decoy_secret": f"SHA256-CANARY-{generate_random_string(16)}",
            "location_context": doc[2],
            "description": doc[1],
            "tags": "document,data-leak,insider-exfiltration"
        }
    else:  # SENSITIVE_FILE
        files = [
            ("/var/www/.env.production.bak", "Fake environment backup file containing dummy master encryption keys", "Web Server root directory `/var/www/`"),
            ("~/.aws/credentials.old", "Fake old AWS credentials file with canary access key", "Developer bastion home directory"),
            ("/etc/kubernetes/admin.conf.sample", "Decoy Kubernetes cluster admin configuration", "DevOps jump box staging directory"),
            ("C:\\Users\\Administrator\\Desktop\\vpn_passwords.txt", "Decoy plaintext VPN password file on simulated administrative desktop", "Administrator Desktop")
        ]
        f = secrets.choice(files)
        return {
            "name": f"Decoy File: {f[0]}",
            "category": "SENSITIVE_FILE",
            "decoy_username": "root/admin",
            "decoy_value": f[0],
            "decoy_secret": f"CANARY_SIG_{generate_random_string(12)}",
            "location_context": f[2],
            "description": f[1],
            "tags": "sensitive-file,privilege-escalation,filesystem"
        }

# Cryptographic token handler for Stateless Admin Session Auth
def create_auth_token(user_id: int, username: str, role: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + (Config.JWT_EXPIRATION_HOURS * 3600)
    }
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signing_input = f"{encoded_header}.{encoded_payload}".encode()
    signature = hmac.new(Config.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    encoded_sig = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{encoded_header}.{encoded_payload}.{encoded_sig}"

def verify_auth_token(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(Config.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        
        # Add padding back if necessary
        sig_b64_padded = sig_b64 + "=" * (-len(sig_b64) % 4)
        provided_sig = base64.urlsafe_b64decode(sig_b64_padded)
        
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
        
        payload_b64_padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64_padded).decode())
        
        if payload.get("exp", 0) < time.time():
            return None
        
        return payload
    except Exception:
        return None
