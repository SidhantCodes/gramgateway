@echo off
echo 🚀 GramGateway MCP Server Deployment Helper
echo ===========================================

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo 📝 Creating .env from template...
    copy .env.example .env
    echo ✅ Please edit .env with your credentials before deploying
    pause
    exit /b 1
)

echo 🔍 Environment file found
echo.
echo Select deployment method:
echo 1^) Local development ^(localhost:8000^)
echo 2^) Docker ^(local^)
echo 3^) Railway.app
echo 4^) Render.com
echo 5^) Heroku
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo 🏃‍♂️ Starting local development server...
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
) else if "%choice%"=="2" (
    echo 🐳 Building and starting Docker container...
    docker build -t gramgateway .
    docker run -p 8000:8000 --env-file .env gramgateway
) else if "%choice%"=="3" (
    echo 🚂 Railway deployment instructions:
    echo 1. Go to https://railway.app
    echo 2. Connect this repository
    echo 3. Set environment variables from your .env file
    echo 4. Deploy!
    pause
) else if "%choice%"=="4" (
    echo 🎨 Render deployment instructions:
    echo 1. Go to https://render.com
    echo 2. Create new Web Service
    echo 3. Connect this repository
    echo 4. Set environment variables from your .env file
    echo 5. Deploy!
    pause
) else if "%choice%"=="5" (
    echo 💜 Heroku deployment:
    echo Install Heroku CLI from: https://devcenter.heroku.com/articles/heroku-cli
    echo Then run: heroku create your-app-name
    echo Set your environment variables in the Heroku dashboard
    echo Finally: git push heroku main
    pause
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)
