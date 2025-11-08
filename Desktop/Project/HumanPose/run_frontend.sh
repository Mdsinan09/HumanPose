#!/bin/bash

# Script to run frontend in a separate terminal
# Usage: ./run_frontend.sh

cd "$(dirname "$0")/pose-detection-frontend"

echo "🚀 Starting Frontend Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

echo "✅ Frontend starting on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start frontend
npm run dev

