#!/bin/bash

# Script to commit and push changes to GitHub
# Usage: ./push_changes.sh

set -e

cd "$(dirname "$0")"

echo "📝 Checking git status..."
git status --short

echo ""
echo "➕ Adding all changes..."
git add pose-detection-frontend/src/components/video/
git add pose-detection-python-backend/src/api/upload_routes.py
git add pose-detection-python-backend/src/models/session.py
git add pose-detection-python-backend/src/services/session_service.py
git add run_backend.sh run_frontend.sh RUN_INSTRUCTIONS.md

echo ""
read -p "Enter commit message (or press Enter for default): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Fix video analysis display and integrate video player with AR overlay"
fi

echo ""
echo "💾 Committing changes..."
git commit -m "$commit_msg"

echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🌐 View your repo at: https://github.com/Mdsinan09/HumanPose"

