# GramGateway 🚀

A modern AI-powered Instagram automation platform with Model Context Protocol (MCP) integration. Upload images, generate AI captions, and automatically post to Instagram with an intuitive Next.js frontend.

## ✨ Features

- 🖼️ **Smart Image Upload**: Drag & drop or browse to upload images
- 🤖 **AI Caption Generation**: Automated caption creation using AI
- 📸 **Instagram Integration**: Direct posting to Instagram
- 🎨 **Modern UI**: Beautiful React frontend with Tailwind CSS
- 🔄 **Real-time Status**: Live server status and upload progress
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔧 **MCP Server**: Integrated Model Context Protocol support
- 🎯 **Gallery View**: Browse and manage uploaded images

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Instagram API**: Direct Instagram integration
- **PIL/Pillow**: Image processing
- **MCP Protocol**: Model Context Protocol server

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **Lucide Icons**: Beautiful icon library
- **React Hot Toast**: Elegant notifications

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Option 1: Full Stack Development (Recommended)
```bash
# Clone and setup
git clone <repository-url>
cd gramgateway

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd frontend-nextjs
npm install
cd ..

# Start both servers
start-fullstack.bat  # On Windows
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend-nextjs

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
gramgateway/
├── main.py                 # FastAPI backend server
├── src/                    # Python source code
│   ├── models.py          # Data models
│   ├── poster.py          # Instagram posting logic
│   ├── login.py           # Authentication
│   └── process_image.py   # Image processing
├── frontend-nextjs/        # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   └── store/             # State management
├── static/                # Static assets
└── input_images/          # Upload directory
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Instagram Credentials (optional - can be set via UI)
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

### Frontend Configuration
The frontend automatically connects to `http://localhost:8001` by default. You can change this in the Settings tab or via environment variables.

## 📱 Usage

1. **Start the Application**
   - Run `start-fullstack.bat` or start both servers manually
   - Open `http://localhost:3000` in your browser

2. **Login to Instagram**
   - Navigate to the "Login" tab
   - Enter your Instagram credentials
   - Click "Login to Instagram"

3. **Upload Images**
   - Go to the "Upload" tab
   - Drag & drop images or click to browse
   - Review the generated caption
   - Click "Post to Instagram"

4. **View Gallery**
   - Check the "Gallery" tab to see all uploaded images
   - View posting status and captions

## 🔌 API Endpoints

- `GET /` - Health check
- `POST /upload` - Upload and process image
- `POST /login` - Instagram login
- `GET /status` - Server status
- `GET /instagram-status` - Instagram login status
- `GET /images` - List uploaded images
- `GET /frontend` - Serve web interface

API documentation available at `http://localhost:8001/docs`

## 🎨 Frontend Components

- **Header**: Branding and navigation
- **StatusBar**: Real-time server status
- **TabNavigation**: Switch between sections
- **UploadSection**: Image upload and posting
- **LoginSection**: Instagram authentication
- **GallerySection**: Image gallery browser
- **SettingsSection**: Configuration panel

## 🔒 Security Notes

- Credentials are handled securely
- No credentials stored in plain text
- HTTPS recommended for production
- Rate limiting implemented for API calls

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
./build-production.bat

# Or manually:
cd frontend-nextjs
npm run build
npm start
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

## 📝 Development

### Adding New Features
1. Backend: Add endpoints in `main.py`
2. Frontend: Create components in `components/`
3. State: Update store in `store/appStore.ts`
4. Styling: Use Tailwind CSS classes

### Code Structure
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for better UX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the GitHub issues
2. Review the API documentation
3. Test with the included examples

---

Built with ❤️ using Next.js, FastAPI, and Modern Web Technologies
