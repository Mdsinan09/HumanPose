#!/bin/bash

# Script to force push to GitHub
# WARNING: Force push will overwrite remote history
# Usage: ./force_push.sh

set -e

cd "$(dirname "$0")"

echo "⚠️  WARNING: This will force push to GitHub and overwrite remote history!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Force push cancelled"
    exit 1
fi

echo ""
echo "📝 Checking git status..."
git status --short

echo ""
echo "➕ Adding all changes..."
git add -A

echo ""
read -p "Enter commit message (or press Enter for default): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Add AR overlay to video, chatbot integration, and video analysis improvements"
fi

echo ""
echo "💾 Committing changes..."
git commit -m "$commit_msg"

echo ""
echo "📤 Force pushing to GitHub..."
git push --force origin main

echo ""
echo "✅ Successfully force pushed to GitHub!"
echo "🌐 View your repo at: https://github.com/Mdsinan09/HumanPose"

