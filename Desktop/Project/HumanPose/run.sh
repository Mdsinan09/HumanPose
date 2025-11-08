#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
# shellcheck disable=SC1091
source venv/bin/activate
if [ -f "requirements.txt" ]; then
  pip install -q -r requirements.txt
else
  pip install -q fastapi uvicorn[standard] python-multipart aiofiles opencv-python mediapipe numpy python-dotenv pillow
fi
export PYTHONPATH="$ROOT:$PYTHONPATH"
exec uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
