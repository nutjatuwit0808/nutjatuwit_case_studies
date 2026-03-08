#!/usr/bin/env bash
# NL2SQL-Lite: Run Execution Accuracy (EX) evaluation
# Usage: ./scripts/run_eval.sh
# Prerequisite: API server running (cd api && uvicorn main:app --reload)
# Requires: .venv with api deps (pip install -r api/requirements.txt)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"
if [ -d ".venv" ]; then
  source .venv/bin/activate
fi
python3 scripts/eval_ex.py
