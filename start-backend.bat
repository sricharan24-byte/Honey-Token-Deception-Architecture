@echo off
echo ========================================================
echo   HONEYGUARD - Deception Architecture SOC Backend
echo ========================================================
echo Starting Python Flask Server on http://127.0.0.1:5000 ...

if exist venv\Scripts\python.exe (
    venv\Scripts\python.exe backend\app.py
) else (
    python backend\app.py
)
pause
