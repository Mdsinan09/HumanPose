#!/bin/bash

# Script to run backend in a separate terminal
# Usage: ./run_backend.sh

cd "$(dirname "$0")/pose-detection-python-backend"

echo "🚀 Starting Backend Server..."
echo ""

# Check if venv exists
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
export PYTHONPATH="${PWD}:${PYTHONPATH}"

echo "✅ Backend starting on http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

