@echo off
echo ========================================================
echo   HONEYGUARD - Starting Complete SOC Platform
echo ========================================================
echo Launching Backend and Frontend in separate windows...

start "HONEYGUARD Backend [Port 5000]" cmd /k "call start-backend.bat"
timeout /t 3 /nobreak >nul
start "HONEYGUARD Frontend [Port 5173]" cmd /k "call start-frontend.bat"

echo.
echo Application launched!
echo Access the SOC Console at: http://localhost:5173
echo Demo Credentials: admin@honeyguard.sec / HoneyGuard2026!
echo.
pause
