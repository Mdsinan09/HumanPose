#!/bin/bash

# Quick script to restart the backend

echo "🔄 Restarting Backend..."

# Kill any existing backend process
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 1

# Start backend
cd pose-detection-python-backend
source venv/bin/activate
export PYTHONPATH="${PWD}:${PYTHONPATH}"
echo "✅ Starting backend on http://localhost:8000"
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

