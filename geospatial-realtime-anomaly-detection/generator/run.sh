#!/bin/bash
set -e
cd "$(dirname "$0")"

# สร้าง venv และติดตั้ง dependencies ถ้ายังไม่มี
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi
.venv/bin/pip3 install -q -r requirements.txt

.venv/bin/python3 main.py
