@echo off
echo Checking GramGateway Services...
echo.

echo Testing Backend API (http://localhost:8001)...
curl -s http://localhost:8001/status > nul
if %errorlevel% == 0 (
    echo ✓ Backend API is running
) else (
    echo ✗ Backend API is not responding
)

echo.
echo Testing Frontend (http://localhost:3000)...
curl -s http://localhost:3000 > nul
if %errorlevel% == 0 (
    echo ✓ Frontend is running
) else (
    echo ✗ Frontend is not responding
)

echo.
echo Testing Backend Health Endpoint...
curl -s http://localhost:8001/ > nul
if %errorlevel% == 0 (
    echo ✓ Backend health check passed
) else (
    echo ✗ Backend health check failed
)

echo.
echo Health check complete!
echo.
echo Service URLs:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8001
echo - API Documentation: http://localhost:8001/docs
echo.
pause
