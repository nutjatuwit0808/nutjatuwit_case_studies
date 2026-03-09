#!/usr/bin/env python3
"""
NL2SQL-Lite: Execution Accuracy (EX) Evaluation Script.

Compares model-generated SQL results against ground-truth (expected_sql) results.
EX = (cases where result matches) / (total cases)

Usage:
  python scripts/eval_ex.py
  ./scripts/eval_ex.py

Prerequisites:
  - API server running (cd api && uvicorn main:app --reload)
  - DATABASE_URL_READONLY in api/.env
  - Seed data loaded (scripts/seed_sample_schema.sql)
"""

import json
import os
import sys
import urllib.request
from decimal import Decimal
from pathlib import Path

# Project root
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load env from api/.env
def _load_env():
    api_env = PROJECT_ROOT / "api" / ".env"
    env_local = PROJECT_ROOT / "api" / ".env.local"
    root_env = PROJECT_ROOT / ".env"
    try:
        from dotenv import load_dotenv
        for p in [api_env, env_local, root_env]:
            if p.exists():
                load_dotenv(p)
    except ImportError:
        pass


def _normalize_value(v):
    """Convert value for comparison (Decimal, date, numeric string -> comparable)."""
    if v is None:
        return None
    if isinstance(v, Decimal):
        return float(v)
    if hasattr(v, "isoformat"):
        return v.isoformat()
    # API returns numbers as strings via JSON; normalize for comparison
    if isinstance(v, str):
        try:
            if "." in v:
                return float(v)
            return int(v)
        except ValueError:
            pass
    return v


def _normalize_row(row) -> tuple:
    """Convert row dict to comparable tuple (sorted by key for consistency)."""
    d = dict(row)  # RealDictRow/dict -> plain dict
    values = []
    for k in sorted(d.keys()):
        values.append(_normalize_value(d[k]))
    return tuple(values)


def _results_equal(actual: list, expected: list) -> bool:
    """Compare result sets (order-independent, column-name-agnostic)."""
    a_tuples = sorted(_normalize_row(r) for r in actual)
    e_tuples = sorted(_normalize_row(r) for r in expected)
    return a_tuples == e_tuples


def _call_api(question: str, schema: str, api_url: str) -> dict:
    """POST to /api/chat-to-sql and return response."""
    payload = json.dumps({"question": question, "schema_hint": schema}).encode()
    req = urllib.request.Request(
        f"{api_url}/api/chat-to-sql",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        return json.load(res)


def _check_api_health(api_url: str) -> bool:
    """Check if API is reachable."""
    try:
        with urllib.request.urlopen(f"{api_url}/health", timeout=5) as res:
            data = json.load(res)
            return data.get("status") == "ok"
    except Exception:
        return False


def main():
    _load_env()

    from api.db import execute_readonly

    api_url = os.getenv("API_URL", "http://localhost:8000")
    tests_path = PROJECT_ROOT / "tests" / "test_cases.json"

    if not tests_path.exists():
        print(f"Error: {tests_path} not found")
        sys.exit(1)

    with open(tests_path, encoding="utf-8") as f:
        data = json.load(f)

    schema = data.get("schema", "")
    test_cases = data.get("test_cases", [])

    # Filter cases that have expected_sql
    cases_with_expected = [c for c in test_cases if c.get("expected_sql")]
    if not cases_with_expected:
        print("Error: No test cases with expected_sql found")
        sys.exit(1)

    print("=== NL2SQL-Lite Execution Accuracy (EX) Evaluation ===")
    print(f"API: {api_url}")
    print(f"Test cases: {len(cases_with_expected)}")
    print()

    if not _check_api_health(api_url):
        print(f"Error: API not reachable at {api_url}")
        print("Start with: cd api && uvicorn main:app --reload")
        sys.exit(1)

    # Check DB
    try:
        execute_readonly("SELECT 1")
        print("Database: connected")
    except Exception as e:
        print(f"Error: Database connection failed: {e}")
        sys.exit(1)
    print()

    results = []
    category_counts = {}

    for case in cases_with_expected:
        case_id = case["id"]
        category = case["category"]
        question = case["question_en"]
        expected_sql = case["expected_sql"]

        if category not in category_counts:
            category_counts[category] = {"pass": 0, "total": 0}

        category_counts[category]["total"] += 1

        try:
            resp = _call_api(question, schema, api_url)
            generated_sql = resp.get("sql", "")
            api_error = resp.get("error")
            actual_result = resp.get("result", [])

            if api_error:
                results.append((case_id, category, False, "API error", generated_sql, expected_sql))
                continue

            try:
                expected_result = execute_readonly(expected_sql)
            except Exception as e:
                results.append((case_id, category, False, f"Expected SQL error: {e}", generated_sql, expected_sql))
                continue

            # print(f"Expected result: {expected_result}")
            # print(f"Actual result: {actual_result}")
            # print("--------------------------------\n")

            if _results_equal(actual_result, expected_result):
                results.append((case_id, category, True, None, generated_sql, expected_sql))
                category_counts[category]["pass"] += 1
            else:
                results.append((case_id, category, False, "result mismatch", generated_sql, expected_sql))

        except urllib.error.HTTPError as e:
            body = e.read().decode() if e.fp else ""
            results.append((case_id, category, False, f"HTTP {e.code}: {body[:200]}", "", expected_sql))
        except Exception as e:
            results.append((case_id, category, False, str(e), "", expected_sql))

    # Print results
    print("--- Results ---")
    for case_id, category, passed, reason, gen_sql, expected_sql in results:
        # print("case id: ", case_id)
        # print("category: ", category)
        # print("passed: ", passed)
        # print("reason: ", reason)
        # print("expected sql: ", expected_sql)
        # print("generated sql: ", gen_sql)
        # print("--------------------------------\n")
        
        status = "[PASS]" if passed else "[FAIL]"
        suffix = f" - {reason}" if reason else ""
        print(f"{status} {case_id} ({category}){suffix}")
    print()

    # Summary
    passed_total = sum(1 for r in results if r[2])
    total = len(results)
    ex_pct = (passed_total / total * 100) if total else 0

    print("--- Summary ---")
    print(f"Execution Accuracy (EX): {passed_total}/{total} = {ex_pct:.2f}%")
    print()
    print("By category:")
    for cat, counts in sorted(category_counts.items()):
        p, t = counts["pass"], counts["total"]
        pct = (p / t * 100) if t else 0
        print(f"  {cat}: {p}/{t} ({pct:.0f}%)")
    print()

    sys.exit(0 if passed_total == total else 1)


if __name__ == "__main__":
    main()
