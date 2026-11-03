"""
HONEYGUARD Automated Verification Test Suite
Tests authentication, honeytoken lifecycle, detection engine, alert triage, and data reset.
"""
import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from database import db_session
from app.models.honeytoken import Honeytoken
from app.models.security_event import SecurityEvent
from app.models.alert import Alert
from app.models.user import User

def run_tests():
    print("=================================================================")
    print("   HONEYGUARD SOC AUTOMATED VERIFICATION TEST SUITE              ")
    print("=================================================================")

    app = create_app()
    client = app.test_client()

    passed = 0
    total = 0

    def assert_test(name, condition):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"[PASS] {name}")
        else:
            print(f"[FAIL] {name}")

    # TEST 1: Admin Authentication
    res = client.post("/api/auth/login", json={"email": "admin@honeyguard.sec", "password": "HoneyGuard2026!"})
    data = res.get_json()
    assert_test("1. Admin Authentication with valid credentials", res.status_code == 200 and data.get("success") is True and "token" in data)
    auth_token = data.get("token")

    # TEST 2: Failed Authentication
    res = client.post("/api/auth/login", json={"email": "admin@honeyguard.sec", "password": "WrongPassword!"})
    assert_test("2. Rejection of invalid credentials", res.status_code == 401)

    # TEST 3: Dashboard Telemetry
    res = client.get("/api/dashboard/stats")
    data = res.get_json()
    assert_test("3. Dashboard telemetry retrieval", res.status_code == 200 and data.get("success") is True and "stats" in data.get("data", {}))

    # TEST 4: Honeytoken Registry & Categories
    res = client.get("/api/honeytokens")
    data = res.get_json()
    assert_test("4. Honeytoken registry listing (>=10 tokens deployed)", res.status_code == 200 and len(data.get("data", [])) >= 10)

    # TEST 5: Decoy Dummy Generator Preview
    res = client.get("/api/honeytokens/generate-preview?category=API_KEY")
    data = res.get_json()
    decoy = data.get("data", {})
    assert_test("5. Decoy generation algorithm produces high-entropy keys", res.status_code == 200 and "AKIA" in decoy.get("decoy_value", "") or "ghp_" in decoy.get("decoy_value", "") or "hg_live" in decoy.get("decoy_value", "") or "sk_live" in decoy.get("decoy_value", ""))

    # TEST 6: Honeytoken Creation
    res = client.post("/api/honeytokens", json={
        "category": "API_KEY",
        "name": "Automated Test AWS Canary Key",
        "decoy_value": "AKIA99TESTINGCANARY99",
        "decoy_secret": "testsecret123",
        "location_context": "Unit Test Repo",
        "description": "Test honeytoken",
        "is_active": True
    })
    data = res.get_json()
    created_id = data.get("honeytoken", {}).get("id")
    assert_test("6. Honeytoken registration & persistence in SQLite", res.status_code == 201 and created_id is not None)

    # TEST 7: Detection Engine Trap Trigger
    res = client.post("/api/deception/login", json={
        "username": "s.jenkins",
        "password": "Fin#2026!Sec99",
        "source_ip": "10.10.4.199"
    })
    data = res.get_json()
    telemetry = data.get("detection_telemetry", {})
    assert_test("7. Detection Engine catches unauthorized employee credential probe (RULE-101)", telemetry.get("rule") == "RULE-101-CREDENTIAL-DECOY" and telemetry.get("severity") == "HIGH")

    # TEST 8: Security Lab Attack Simulation (Multiple Suspicious Burst)
    res = client.post("/api/deception/simulate-attack", json={"attack_type": "simulate_multiple_suspicious"})
    data = res.get_json()
    assert_test("8. Security Lab multi-attempt burst escalation to CRITICAL (RULE-201)", data.get("status") == "CRITICAL_DETECTED" and data.get("final_severity") == "CRITICAL")

    # TEST 9: Alert Triage Workflow
    alerts_res = client.get("/api/alerts?status=ACTIVE")
    alerts_data = alerts_res.get_json().get("data", [])
    if alerts_data:
        target_alert_id = alerts_data[0]["id"]
        review_res = client.put(f"/api/alerts/{target_alert_id}/review", json={
            "status": "REVIEWED",
            "mitigation_notes": "Unit test verified incident."
        })
        assert_test("9. Alert triage & investigation status update", review_res.status_code == 200 and review_res.get_json().get("alert", {}).get("status") == "REVIEWED")
    else:
        assert_test("9. Alert triage & investigation status update", False)

    # TEST 10: Demonstration Reset
    reset_res = client.post("/api/settings/reset-demo")
    assert_test("10. Reset demonstration data to baseline", reset_res.status_code == 200 and reset_res.get_json().get("success") is True)

    print("-----------------------------------------------------------------")
    print(f"RESULTS: {passed}/{total} tests passed ({round(passed/total*100, 1)}%)")
    print("=================================================================")
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
