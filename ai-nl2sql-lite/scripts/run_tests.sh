#!/usr/bin/env bash
# NL2SQL-Lite: Run test cases against API
# Usage: ./scripts/run_tests.sh
# Prerequisite: API server running (cd api && uvicorn main:app --reload)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TESTS_JSON="$PROJECT_DIR/tests/test_cases.json"
API_URL="${API_URL:-http://localhost:8000}"

if ! command -v curl &>/dev/null; then
  echo "Error: curl is required"
  exit 1
fi

if ! curl -s "$API_URL/health" | grep -q '"status":"ok"'; then
  echo "Error: API not reachable at $API_URL. Start with: cd api && uvicorn main:app --reload"
  exit 1
fi

echo "=== NL2SQL-Lite Test Runner ==="
echo "API: $API_URL"
echo ""

# Read schema from test_cases.json (requires jq)
if command -v jq &>/dev/null; then
  SCHEMA=$(jq -r '.schema' "$TESTS_JSON")
  CASES=$(jq -c '.test_cases[]' "$TESTS_JSON")
else
  echo "Warning: jq not found. Using question-only mode (no schema_hint)."
  echo "Install jq for full test coverage: brew install jq"
  SCHEMA=""
  CASES=""
fi

run_test() {
  local question="$1"
  local schema="$2"
  local id="$3"
  local category="$4"

  if command -v jq &>/dev/null; then
    if [ -n "$schema" ]; then
      payload=$(jq -n --arg q "$question" --arg s "$schema" '{question: $q, schema_hint: $s}')
    else
      payload=$(jq -n --arg q "$question" '{question: $q}')
    fi
    response=$(curl -s -X POST "$API_URL/api/chat-to-sql" -H "Content-Type: application/json" -d "$payload")
    sql=$(echo "$response" | jq -r '.sql // "N/A"')
    error=$(echo "$response" | jq -r '.error // empty')
    result_count=$(echo "$response" | jq -r '.result | length // 0')
  else
    payload=$(python3 -c "import json,sys; print(json.dumps({'question': sys.argv[1]}))" "$question")
    response=$(curl -s -X POST "$API_URL/api/chat-to-sql" -H "Content-Type: application/json" -d "$payload")
    sql=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sql','N/A'))" 2>/dev/null || echo "N/A")
    error=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error','') or '')" 2>/dev/null || true)
    result_count=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('result',[])))" 2>/dev/null || echo "?")
  fi

  echo "--- [$id] $category ---"
  echo "Q: $question"
  echo "SQL: $sql"
  if [ -n "$error" ]; then
    echo "Error: $error"
  else
    echo "Result rows: $result_count"
  fi
  echo ""
}

if command -v jq &>/dev/null && [ -f "$TESTS_JSON" ]; then
  SCHEMA=$(jq -r '.schema' "$TESTS_JSON")
  while IFS= read -r line; do
    id=$(echo "$line" | jq -r '.id')
    category=$(echo "$line" | jq -r '.category')
    question_th=$(echo "$line" | jq -r '.question_th')
    run_test "$question_th" "$SCHEMA" "$id" "$category"
  done < <(jq -c '.test_cases[]' "$TESTS_JSON")
else
  run_test "รวมยอดขายทั้งหมด" "" "aggregation-sum" "Aggregation SUM"
  run_test "สินค้าประเภท Electronics มีอะไรบ้าง" "" "simple-select" "Simple SELECT"
  run_test "What is the total sales amount?" "" "aggregation-sum-en" "Aggregation SUM (EN)"
fi

echo "=== Done ==="
