#!/bin/bash

# GramGateway Quick Deploy Script

echo "🚀 GramGateway MCP Server Deployment Helper"
echo "==========================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ Please edit .env with your credentials before deploying"
    exit 1
fi

echo "🔍 Environment file found"

# Choose deployment method
echo ""
echo "Select deployment method:"
echo "1) Local development (localhost:8000)"
echo "2) Docker (local)"
echo "3) Railway.app"
echo "4) Render.com"
echo "5) Heroku"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🏃‍♂️ Starting local development server..."
        python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
        ;;
    2)
        echo "🐳 Building and starting Docker container..."
        docker build -t gramgateway .
        docker run -p 8000:8000 --env-file .env gramgateway
        ;;
    3)
        echo "🚂 Railway deployment instructions:"
        echo "1. Go to https://railway.app"
        echo "2. Connect this repository"
        echo "3. Set environment variables from your .env file"
        echo "4. Deploy!"
        ;;
    4)
        echo "🎨 Render deployment instructions:"
        echo "1. Go to https://render.com"
        echo "2. Create new Web Service"
        echo "3. Connect this repository"
        echo "4. Set environment variables from your .env file"
        echo "5. Deploy!"
        ;;
    5)
        echo "💜 Heroku deployment:"
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not installed"
            echo "Install from: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        read -p "Enter Heroku app name: " app_name
        heroku create $app_name
        
        # Set config vars from .env
        while IFS='=' read -r key value; do
            if [[ ! $key =~ ^# ]] && [[ $key != "" ]]; then
                heroku config:set $key="$value" --app $app_name
            fi
        done < .env
        
        echo "🚀 Deploying to Heroku..."
        git push heroku main
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
