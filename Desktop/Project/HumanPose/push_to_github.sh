#!/bin/bash

# Script to push HumanPose to GitHub
# Usage: ./push_to_github.sh

set -e

GITHUB_USER="Mdsinan09"
REPO_NAME="HumanPose"

echo "🚀 Pushing HumanPose to GitHub..."
echo ""

# Check if remote already exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote 'origin' already exists"
    git remote set-url origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
else
    echo "➕ Adding remote 'origin'..."
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

echo ""
echo "📋 Current remote configuration:"
git remote -v
echo ""

# Check if GitHub repo exists (this will fail if it doesn't exist, which is expected)
echo "⚠️  Make sure you've created the repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Repository name: ${REPO_NAME}"
echo "   Visibility: Public or Private (your choice)"
echo "   DO NOT initialize with README, .gitignore, or license"
echo ""
read -p "Press Enter after you've created the repository on GitHub..."

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🌐 View your repo at: https://github.com/${GITHUB_USER}/${REPO_NAME}"

