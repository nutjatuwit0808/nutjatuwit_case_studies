"""
PostgreSQL read-only connection for NL2SQL execution.
Uses DATABASE_URL_READONLY (nl2sql_readonly user).
"""

import os
from contextlib import contextmanager
from typing import Generator

import psycopg2
from psycopg2.extras import RealDictCursor


def get_readonly_connection_string() -> str:
    url = os.getenv("DATABASE_URL_READONLY")
    if not url:
        raise RuntimeError(
            "DATABASE_URL_READONLY must be set in .env or environment"
        )
    return url


@contextmanager
def get_readonly_connection() -> Generator:
    """Context manager for read-only DB connection."""
    conn = psycopg2.connect(
        get_readonly_connection_string(),
        cursor_factory=RealDictCursor,
    )
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute_readonly(sql: str) -> list[dict]:
    """Execute SELECT and return rows as list of dicts."""
    with get_readonly_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return list(cur.fetchall())
