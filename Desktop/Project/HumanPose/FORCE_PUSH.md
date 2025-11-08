# ⚠️ Force Push to GitHub

## ⚠️ WARNING

**Force pushing will overwrite the remote repository history!** Only use this if you're sure you want to replace the remote branch with your local version.

## Quick Force Push

### Option 1: Using Script (Recommended)

```bash
./force_push.sh
```

This will:
1. Show warning
2. Ask for confirmation
3. Add all changes
4. Commit with message
5. Force push to GitHub

### Option 2: Manual Commands

```bash
# Add all changes
git add -A

# Commit
git commit -m "Add AR overlay to video, chatbot integration, and video analysis improvements"

# Force push
git push --force origin main
```

### Option 3: One-Line Force Push

```bash
git add -A && git commit -m "Add AR overlay to video, chatbot integration, and video analysis improvements" && git push --force origin main
```

## What's Being Pushed

- ✅ Video AR overlay with joints and skeleton lines
- ✅ Chatbot page integration
- ✅ Chatbot in image results
- ✅ Video analysis improvements
- ✅ Backend landmark extraction for video frames
- ✅ All recent fixes and enhancements

## Alternative: Regular Push (Safer)

If you want to avoid force push:

```bash
# Add changes
git add -A

# Commit
git commit -m "Add AR overlay to video, chatbot integration, and video analysis improvements"

# Regular push (will fail if remote has changes)
git push origin main

# If it fails, pull first:
git pull origin main --rebase
git push origin main
```

## ⚠️ When to Use Force Push

- ✅ You're the only one working on the repo
- ✅ You want to completely replace remote with local
- ✅ You've made mistakes and want to rewrite history

## ❌ When NOT to Use Force Push

- ❌ Working with a team
- ❌ Others have pushed changes
- ❌ You want to preserve remote history
- ❌ On shared/main branches

## Recovering from Force Push

If you need to recover:

```bash
# Check reflog
git reflog

# Reset to previous commit
git reset --hard HEAD@{n}

# Force push again
git push --force origin main
```

