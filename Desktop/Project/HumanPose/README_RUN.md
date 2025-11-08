# 🚀 How to Run HumanPose Application

## Quick Start (Recommended)

### Option 1: Using the Start Script (Easiest)

```bash
# Make scripts executable (first time only)
chmod +x start.sh stop.sh

# Start both backend and frontend
./start.sh

# To stop, press Ctrl+C or run:
./stop.sh
```

This will:
- ✅ Start backend on http://localhost:8000
- ✅ Start frontend on http://localhost:5173
- ✅ Install dependencies automatically if needed

---

## Manual Setup

### Step 1: Backend Setup

```bash
cd pose-detection-python-backend

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies (first time only)
pip install -r requirements.txt

# Set PYTHONPATH
export PYTHONPATH="${PWD}:${PYTHONPATH}"

# Start backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**

### Step 2: Frontend Setup

Open a **new terminal window** and run:

```bash
cd pose-detection-frontend

# Install dependencies (first time only)
npm install

# Start frontend development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 📋 Prerequisites

### Backend Requirements:
- Python 3.8 or higher
- pip (Python package manager)

### Frontend Requirements:
- Node.js 16 or higher
- npm (comes with Node.js)

### Check if you have them:
```bash
python3 --version  # Should show Python 3.8+
node --version      # Should show v16+
npm --version       # Should show 8+
```

---

## 🔧 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

**Backend (port 8000):**
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Frontend (port 5173):**
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Backend Dependencies Issues

```bash
cd pose-detection-python-backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend Dependencies Issues

```bash
cd pose-detection-frontend
rm -rf node_modules package-lock.json
npm install
```

### Backend Not Starting

Check if all required directories exist:
```bash
cd pose-detection-python-backend
mkdir -p uploads/images uploads/videos results sessions logs
```

---

## 📝 API Endpoints

Once backend is running, you can test:

- **Health Check:** http://localhost:8000/health
- **API Docs:** http://localhost:8000/docs
- **Image Analysis:** POST http://localhost:8000/api/analyze/image
- **Video Upload:** POST http://localhost:8000/api/upload/video

---

## 🎯 Usage

1. **Start both servers** (using `./start.sh` or manually)
2. **Open browser** to http://localhost:5173
3. **Upload an image or video** for pose analysis
4. **View results** with scores and feedback

---

## 📊 Logs

- **Backend logs:** Check terminal where backend is running
- **Frontend logs:** Check terminal where frontend is running
- **If using start.sh:** Check `backend.log` and `frontend.log` files

---

## 🛑 Stopping the Application

### If using start.sh:
- Press `Ctrl+C` in the terminal
- Or run: `./stop.sh`

### If running manually:
- Press `Ctrl+C` in each terminal window

---

## ✅ Verification

After starting, verify everything works:

1. **Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Frontend:**
   - Open http://localhost:5173 in browser
   - You should see the HumanPose interface

3. **Test Image Upload:**
   - Go to Image Analysis page
   - Upload a test image
   - Should see pose detection results

---

## 🆘 Need Help?

- Check backend logs for errors
- Check frontend console (F12 in browser)
- Ensure both servers are running
- Verify ports 8000 and 5173 are not blocked

