# 🏋️ HumanPose - AI-Powered Pose Detection & Analysis

A full-stack application for real-time human pose detection and exercise analysis using MediaPipe and FastAPI.

## ✨ Features

- 📸 **Image Analysis** - Upload images for instant pose detection and scoring
- 🎥 **Video Analysis** - Analyze exercise videos frame-by-frame with detailed feedback
- 📊 **Real-time Scoring** - Get detailed scores and feedback on your form
- 🤖 **AI Coach** - Interactive chatbot for exercise guidance
- 🎯 **Multiple Exercise Types** - Support for squats, general poses, and more

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MediaPipe** - Pose detection ML model
- **OpenCV** - Image/video processing
- **Uvicorn** - ASGI server

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mdsinan09/HumanPose.git
   cd HumanPose
   ```

2. **Start the application**
   ```bash
   # Make scripts executable
   chmod +x start.sh stop.sh
   
   # Start both backend and frontend
   ./start.sh
   ```

   Or see [README_RUN.md](README_RUN.md) for detailed manual setup instructions.

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
HumanPose/
├── pose-detection-python-backend/  # FastAPI backend
│   ├── src/
│   │   ├── api/                    # API routes
│   │   ├── ml/                     # ML models & scoring
│   │   ├── services/               # Business logic
│   │   └── models/                 # Data models
│   └── requirements.txt
│
├── pose-detection-frontend/         # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                  # Page components
│   │   ├── api/                    # API clients
│   │   └── services/               # Frontend services
│   └── package.json
│
├── start.sh                        # Start script
├── stop.sh                         # Stop script
└── README.md                       # This file
```

## 🔌 API Endpoints

- `POST /api/analyze/image` - Analyze uploaded image
- `POST /api/upload/video` - Upload and analyze video
- `GET /api/sessions/{session_id}` - Get analysis session results
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## 🧪 Development

### Backend Development
```bash
cd pose-detection-python-backend
source venv/bin/activate
export PYTHONPATH="${PWD}:${PYTHONPATH}"
uvicorn src.main:app --reload
```

### Frontend Development
```bash
cd pose-detection-frontend
npm install
npm run dev
```

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Mdsinan09**
- GitHub: [@Mdsinan09](https://github.com/Mdsinan09)

## 🙏 Acknowledgments

- MediaPipe for pose detection models
- FastAPI for the excellent web framework
- React community for amazing tools

