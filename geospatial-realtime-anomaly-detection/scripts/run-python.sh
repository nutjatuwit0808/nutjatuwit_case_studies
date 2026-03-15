#!/bin/bash
# รัน Python service (ai-service หรือ generator)
# ใช้: ./scripts/run-python.sh ai-service
# ใช้: ./scripts/run-python.sh generator
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE_DIR="${1:?Usage: $0 <ai-service|generator>}"

cd "$PROJECT_ROOT/$SERVICE_DIR"

if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi
.venv/bin/pip3 install -q -r requirements.txt

.venv/bin/python3 main.py
