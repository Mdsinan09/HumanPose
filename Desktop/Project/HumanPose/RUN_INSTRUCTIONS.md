# 🚀 Running Frontend and Backend in Separate Terminals

## Quick Start

### Option 1: Using the Scripts (Easiest)

**Terminal 1 - Backend:**
```bash
./run_backend.sh
```

**Terminal 2 - Frontend:**
```bash
./run_frontend.sh
```

### Option 2: Manual Commands

**Terminal 1 - Backend:**
```bash
cd pose-detection-python-backend
source venv/bin/activate
export PYTHONPATH="${PWD}:${PYTHONPATH}"
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd pose-detection-frontend
npm run dev
```

## 📋 Step-by-Step Instructions

### Step 1: Open Two Terminal Windows

1. Open your first terminal (Terminal 1) - for Backend
2. Open your second terminal (Terminal 2) - for Frontend

### Step 2: Start Backend (Terminal 1)

In **Terminal 1**, run:
```bash
cd /Users/mac/Desktop/Project/HumanPose
./run_backend.sh
```

You should see:
```
🚀 Starting Backend Server...
✅ Backend starting on http://localhost:8000
📚 API Docs: http://localhost:8000/docs
```

### Step 3: Start Frontend (Terminal 2)

In **Terminal 2**, run:
```bash
cd /Users/mac/Desktop/Project/HumanPose
./run_frontend.sh
```

You should see:
```
🚀 Starting Frontend Server...
✅ Frontend starting on http://localhost:5173
```

### Step 4: Access the Application

- **Frontend**: Open http://localhost:5173 in your browser
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛑 Stopping the Servers

- **Backend**: In Terminal 1, press `Ctrl+C`
- **Frontend**: In Terminal 2, press `Ctrl+C`

## 🔍 Verifying Everything Works

1. **Check Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Check Frontend:**
   - Open http://localhost:5173
   - You should see the HumanPose interface

## 🐛 Troubleshooting

### Backend Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Frontend Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Backend Dependencies Missing
```bash
cd pose-detection-python-backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Dependencies Missing
```bash
cd pose-detection-frontend
npm install
```

## 📝 Notes

- Keep both terminals open while developing
- Backend will auto-reload on code changes (thanks to `--reload`)
- Frontend will auto-reload on code changes (Vite hot reload)
- Backend logs will show in Terminal 1
- Frontend logs will show in Terminal 2

## ✅ Success Indicators

**Backend is running when you see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Frontend is running when you see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

