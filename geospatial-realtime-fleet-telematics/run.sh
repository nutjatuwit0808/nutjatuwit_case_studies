#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# โหลด env จาก .env หรือ .env.local
if [ -f .env ]; then
  set -a
  source .env
  set +a
  echo "Loaded .env"
elif [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
  echo "Loaded .env.local"
else
  echo "Warning: No .env or .env.local found. Create from .env.example"
fi

# ติดตั้ง dependencies
echo "Installing API dependencies..."
cd api && npm install && cd "$ROOT"

echo "Installing Dashboard dependencies..."
cd dashboard && npm install && cd "$ROOT"

# ฟังก์ชัน cleanup เมื่อกด Ctrl+C
cleanup() {
  echo ""
  echo "Stopping..."
  kill $API_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# รัน API ใน background
echo "Starting API on http://localhost:${API_PORT:-3001}..."
cd api && npm run start:dev &
API_PID=$!
cd "$ROOT"

# รอให้ API พร้อม
sleep 3

# รัน Dashboard
echo "Starting Dashboard on http://localhost:3000..."
cd dashboard && npm run dev
