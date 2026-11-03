# HONEYGUARD - REST API Specification

This document details all REST endpoints provided by the HONEYGUARD SOC backend.

Base URL: `http://127.0.0.1:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/login`
Authenticates SOC administrator and issues signed JWT bearer token.

- **Request Body:**
  ```json
  {
    "email": "admin@honeyguard.sec",
    "password": "HoneyGuard2026!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiAiSFMyNTYi...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@honeyguard.sec",
      "role": "ADMIN"
    }
  }
  ```

### `GET /auth/me`
Returns details of the currently authenticated administrator. Requires `Authorization: Bearer <token>`.

### `POST /auth/change-password`
Updates administrator password. Requires authentication.

---

## 2. Dashboard Endpoints

### `GET /dashboard/stats`
Returns aggregated SOC metrics, 7-day daily activity trends, category distribution, severity distribution, top triggered decoys, and recent events.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "total_tokens": 10,
        "active_tokens": 10,
        "total_interactions": 15,
        "active_alerts": 4,
        "critical_incidents": 2,
        "false_positive_rate": "0.0%",
        "mean_time_to_detect": "85ms"
      },
      "severity_distribution": {
        "CRITICAL": 2,
        "HIGH": 5,
        "MEDIUM": 1,
        "LOW": 0
      },
      "daily_trends": [...],
      "top_tokens": [...],
      "recent_events": [...]
    }
  }
  ```

---

## 3. Honeytoken Management Endpoints

### `GET /honeytokens`
Query parameters:
- `category` (`EMPLOYEE_CREDENTIAL`, `API_KEY`, `DATABASE_CREDENTIAL`, `DECOY_DOCUMENT`, `SENSITIVE_FILE`, `ALL`)
- `is_active` (`true`, `false`)
- `search` (keyword string)

### `POST /honeytokens`
Creates and registers a new honeytoken.
- **Request Body:**
  ```json
  {
    "category": "API_KEY",
    "name": "AWS Production IAM Canary Key",
    "decoy_value": "AKIA2V8N9EXAMPLE7482",
    "decoy_secret": "wJalrXUtnFEMI/K7MDENG...",
    "location_context": "Developer Git repo .env.example",
    "description": "High-entropy decoy AWS credential",
    "is_active": true,
    "tags": "cloud,aws,canary"
  }
  ```

### `PUT /honeytokens/<id>`
Updates metadata or arms/disarms a honeytoken (`is_active: false`).

### `DELETE /honeytokens/<id>`
Deletes a honeytoken and cascades associated alerts and events.

### `GET /honeytokens/<id>/history`
Returns interaction events specific to the given honeytoken.

### `GET /honeytokens/generate-preview?category=<CAT>`
Generates high-entropy realistic dummy decoy values on demand.

---

## 4. Deception & Attack Simulation Endpoints

### `POST /deception/access`
Generic interaction handler for any decoy asset.

### `POST /deception/login`
Simulates an authentication attempt against the fake employee intranet portal.
- **Request Body:**
  ```json
  {
    "username": "s.jenkins",
    "password": "Fin#2026!Sec99",
    "source_ip": "10.10.4.102"
  }
  ```

### `GET /deception/api-gateway`
Simulates an API invocation using an `X-Honey-Key` header.

### `POST /deception/database-query`
Simulates unauthorized SQL queries against decoy database connections.

### `GET /deception/document/<doc_name>`
Simulates opening or downloading a canary-tracked confidential document.

### `POST /deception/simulate-attack`
Security Lab 1-click test simulation handler.
- **Request Body:**
  ```json
  {
    "attack_type": "simulate_fake_credential"
  }
  ```
  Supported types:
  - `simulate_fake_credential`
  - `simulate_decoy_api_key`
  - `simulate_fake_database`
  - `simulate_confidential_file`
  - `simulate_multiple_suspicious`

---

## 5. Threat Alert Endpoints

### `GET /alerts`
Query parameters: `severity`, `status`, `search`, `limit`.

### `GET /alerts/<id>`
Returns complete alert metadata and associated event details.

### `PUT /alerts/<id>/review`
Updates alert triage status (`REVIEWED`, `RESOLVED`, `ACTIVE`) and records analyst investigation notes.

---

## 6. Events & Reporting Endpoints

### `GET /events`
Returns paginated audit trail of security events. Query parameters: `page`, `per_page`, `category`, `severity`, `search`.

### `GET /reports/export?type=events|alerts|honeytokens`
Streams formatted CSV export for offline analysis.

### `GET /reports/summary`
Returns JSON executive summary report suitable for PDF generation.

---

## 7. Settings Endpoints

### `GET /settings`
Returns application diagnostics, database size, and heuristic rule counts.

### `POST /settings/reset-demo`
Wipes mutable data and reseeds initial 10 honeytokens, 15 security events, and 8 alerts.
