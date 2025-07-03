# GramGateway MCP Server Deployment Guide

## 🚀 Hosting Options

### 1. Railway (Recommended - Free Tier Available)

**Steps:**
1. Create account at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   - `IG_USERNAME`: your_instagram_username
   - `IG_PASSWORD`: your_instagram_password
   - `GOOGLE_API_KEY`: your_google_api_key (optional)
4. Deploy automatically

**Files needed:** ✅ Already created
- `railway.json`
- `Procfile`
- `requirements.txt`

### 2. Render.com (Free Tier)

**Steps:**
1. Create account at [Render.com](https://render.com)
2. Connect GitHub repository
3. Use Web Service with:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables in dashboard

**Files needed:** ✅ Already created
- `render.yaml`
- `requirements.txt`

### 3. Heroku

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set config vars:
   ```bash
   heroku config:set IG_USERNAME=your_username
   heroku config:set IG_PASSWORD=your_password
   ```
5. Deploy: `git push heroku main`

**Files needed:** ✅ Already created
- `Procfile`
- `runtime.txt`
- `requirements.txt`

### 4. Docker (Any Platform)

**Steps:**
1. Build: `docker build -t gramgateway .`
2. Run: `docker run -p 8000:8000 --env-file .env gramgateway`

**Or with Docker Compose:**
```bash
docker-compose up -d
```

**Files needed:** ✅ Already created
- `Dockerfile`
- `docker-compose.yml`

### 5. VPS/Cloud Server

**Steps:**
1. Get a VPS (DigitalOcean, Linode, AWS EC2, etc.)
2. Install Python 3.12+
3. Clone repository
4. Install dependencies: `pip install -r requirements.txt`
5. Run with systemd service or screen/tmux

## 🔒 Security Considerations

### Environment Variables
Never commit credentials to Git. Use environment variables:

```bash
# Set these in your hosting platform
IG_USERNAME=your_instagram_username
IG_PASSWORD=your_instagram_password
GOOGLE_API_KEY=your_google_api_key
```

### Domain & HTTPS
- Most hosting platforms provide HTTPS automatically
- Use custom domain for production
- Consider rate limiting for public APIs

## 🌐 MCP Integration

Once deployed, update your VS Code settings.json:

```json
{
  "github.copilot.chat.experimental.mcpServers": {
    "gramgateway": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "https://your-deployed-app.com/mcp",
        "-H", "Content-Type: application/json"
      ]
    }
  }
}
```

## 📊 Monitoring

Add these endpoints for monitoring:
- Health check: `GET /health`
- Status: `GET /instagram/status`
- Processed images: `GET /images/processed`

## 🔄 CI/CD

For automatic deployments, most platforms support:
- GitHub Actions
- Automatic deploys on git push
- Environment-specific configurations

## 💡 Recommendations

**Best for beginners:** Railway or Render
**Best for production:** VPS with Docker
**Best for scaling:** AWS/GCP with container services

Choose based on your needs:
- **Free hosting:** Railway, Render, Heroku (limited hours)
- **Always-on:** Paid VPS or cloud platforms
- **High traffic:** Load balancer + multiple instances
