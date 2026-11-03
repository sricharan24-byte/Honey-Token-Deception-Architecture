# HONEYGUARD - Setup, Installation & Verification Guide

This guide walks you through setting up, configuring, and verifying the HONEYGUARD Deception & Threat Detection SOC application locally.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Python**: 3.10, 3.11, 3.12, or 3.15
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

## 2. Quick Start (Windows 1-Click Launch)

If you are on Windows, simply double-click:
```bat
run.bat
```
This automatically starts:
1. The Python Flask backend server on `http://127.0.0.1:5000`
2. The Vite React frontend application on `http://localhost:5173`

---

## 3. Manual Step-by-Step Setup

### Step A: Backend Setup

1. Open a terminal and navigate to the project root directory:
   ```bash
   cd "Honey Token"
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Start the backend server:
   ```bash
   python backend/app.py
   ```
   *Expected Output:*
   ```text
   [*] HONEYGUARD Threat Detection Server running on http://127.0.0.1:5000
   * Running on http://127.0.0.1:5000
   ```
   *Note: On first startup, HONEYGUARD automatically initializes the SQLite database (`honeyguard.db`) and seeds 10 realistic honeytokens, 15 security events, and 8 alerts.*

---

### Step B: Frontend Setup

1. Open a second terminal window and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Expected Output:*
   ```text
   VITE v8.3.5 ready in 250 ms
   ➜  Local:   http://localhost:5173/
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 4. Default Demonstration Credentials

Use the pre-configured administrator account to log in:

- **Email:** `admin@honeyguard.sec`
- **Username:** `admin`
- **Password:** `HoneyGuard2026!`
- **Role:** `ADMIN`

*(Tip: On the login page, click the "Auto-fill Demo Credentials" button for instant entry).*

---

## 5. Verification Checklist

To verify that all components are functioning:

- [x] **Backend Health Check:** `http://127.0.0.1:5000/api/settings/health` returns `{"status": "HEALTHY"}`
- [x] **Database Seeding:** SQLite database created at `backend/honeyguard.db`
- [x] **Admin Login:** Successfully logs into the SOC console
- [x] **Live Metrics:** Dashboard displays 10 deployed tokens, 15 interactions, 4 active alerts, and 2 critical incidents
- [x] **Simulation Execution:** Security Lab runs simulated attacks and shows instant alert popups
- [x] **CSV Export:** Clicking "Events CSV" downloads a timestamped audit log
- [x] **Report Generation:** Clicking "Print SOC Executive Report" renders the print dialog
