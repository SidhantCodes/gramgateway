@echo off
cd /d "C:\Users\Adity\OneDrive - Bharatividyapeeth\Backup\Web\gramgateway"
echo Starting GramGateway MCP Server...
echo Server will be available at http://localhost:8000
echo.
".venv\Scripts\python.exe" -m uvicorn main:app --host localhost --port 8000 --reload
pause
