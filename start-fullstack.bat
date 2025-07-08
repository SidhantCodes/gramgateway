@echo off
echo Starting GramGateway Full Stack Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d \"%~dp0\" && uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d \"%~dp0frontend-nextjs\" && npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:8001
echo Frontend will be available at: http://localhost:3000
echo Backend API docs: http://localhost:8001/docs
echo.
echo Press any key to exit...
pause > nul
