#!/bin/bash

# HumanPose - Start Script
# This script starts both backend and frontend servers

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "🚀 Starting HumanPose Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Check ports
echo "Checking ports..."
check_port 8000 || echo "Backend port 8000 is in use"
check_port 5173 || echo "Frontend port 5173 is in use"
echo ""

# Start Backend
echo -e "${BLUE}📦 Starting Backend Server...${NC}"
cd "$ROOT/pose-detection-python-backend"

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    touch venv/.installed
fi

# Set PYTHONPATH
export PYTHONPATH="$ROOT/pose-detection-python-backend:$PYTHONPATH"

# Start backend in background
echo -e "${GREEN}✅ Backend starting on http://localhost:8000${NC}"
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo -e "${BLUE}📦 Starting Frontend Server...${NC}"
cd "$ROOT/pose-detection-frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Start frontend in background
echo -e "${GREEN}✅ Frontend starting on http://localhost:5173${NC}"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}🎉 Both servers are starting!${NC}"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "To stop servers, run: ./stop.sh"
echo "Or manually kill PIDs: kill $BACKEND_PID $FRONTEND_PID"

# Save PIDs to file
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Wait for user interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; exit" INT TERM

# Keep script running
wait

