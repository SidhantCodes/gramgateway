@echo off
echo Building GramGateway for Production...
echo.

echo Building Next.js Frontend...
cd "%~dp0frontend-nextjs"
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo Production build complete!
echo.
echo To run in production mode:
echo 1. Backend: uvicorn main:app --host 0.0.0.0 --port 8001
echo 2. Frontend: cd frontend-nextjs && npm start
echo.
pause
