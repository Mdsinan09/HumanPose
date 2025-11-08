# 🚀 Push to GitHub - Step by Step Guide

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `HumanPose`
3. Description: `AI-powered pose detection and exercise analysis application`
4. Visibility: Choose **Public** or **Private** (your choice)
5. ⚠️ **IMPORTANT**: Do NOT check any of these:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

## Step 2: Push Your Code

### Option A: Using the Script (Easiest)

```bash
./push_to_github.sh
```

The script will:
- Add the GitHub remote
- Push your code to GitHub
- Set up the main branch

### Option B: Manual Push

```bash
# Add remote (if not already added)
git remote add origin https://github.com/Mdsinan09/HumanPose.git

# Or update existing remote
git remote set-url origin https://github.com/Mdsinan09/HumanPose.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

After pushing, visit:
**https://github.com/Mdsinan09/HumanPose**

You should see all your files there!

## 🔐 Authentication

If you get authentication errors:

### Option 1: Use Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

### Option 2: Use SSH (Recommended)
```bash
# Change remote to SSH
git remote set-url origin git@github.com:Mdsinan09/HumanPose.git

# Push
git push -u origin main
```

## ✅ Done!

Your repository is now on GitHub! 🎉

