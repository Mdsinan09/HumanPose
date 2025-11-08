#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:${PWD}"

# Run server
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
