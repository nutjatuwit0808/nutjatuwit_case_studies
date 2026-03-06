"""
Fetch DDL (CREATE TABLE) from PostgreSQL for context injection.
Uses information_schema to build CREATE TABLE statements for public schema.
"""

from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor

from db import get_readonly_connection_string

# PostgreSQL type mapping from information_schema
TYPE_MAP = {
    "character varying": "VARCHAR",
    "varchar": "VARCHAR",
    "text": "TEXT",
    "integer": "INTEGER",
    "int": "INTEGER",
    "bigint": "BIGINT",
    "smallint": "SMALLINT",
    "numeric": "NUMERIC",
    "decimal": "DECIMAL",
    "real": "REAL",
    "double precision": "DOUBLE PRECISION",
    "boolean": "BOOLEAN",
    "date": "DATE",
    "timestamp without time zone": "TIMESTAMP",
    "timestamp with time zone": "TIMESTAMPTZ",
    "uuid": "UUID",
    "jsonb": "JSONB",
    "json": "JSON",
}


def _normalize_type(udt_name: str, character_maximum_length: Optional[int]) -> str:
    base = TYPE_MAP.get(udt_name.lower(), udt_name.upper())
    if character_maximum_length and "CHAR" in base:
        return f"{base}({character_maximum_length})"
    return base


def fetch_ddl(schema: str = "public") -> str:
    """
    Build CREATE TABLE DDL for all tables in schema.
    Uses information_schema.columns.
    """
    conn = psycopg2.connect(
        get_readonly_connection_string(),
        cursor_factory=RealDictCursor,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT table_name, column_name, data_type, udt_name,
                       character_maximum_length, is_nullable
                FROM information_schema.columns
                WHERE table_schema = %s
                  AND table_name NOT LIKE 'pg_%%'
                ORDER BY table_name, ordinal_position
                """,
                (schema,),
            )
            rows = cur.fetchall()

        # Group by table
        tables: dict[str, list[dict]] = {}
        for r in rows:
            t = r["table_name"]
            if t not in tables:
                tables[t] = []
            tables[t].append(r)

        ddl_parts = []
        for table_name in sorted(tables.keys()):
            cols = tables[table_name]
            col_defs = []
            for c in cols:
                col_type = _normalize_type(
                    c["udt_name"],
                    c.get("character_maximum_length"),
                )
                nullable = "" if c["is_nullable"] == "YES" else " NOT NULL"
                col_defs.append(f'  {c["column_name"]} {col_type}{nullable}')
            ddl_parts.append(f"CREATE TABLE {table_name} (\n" + ",\n".join(col_defs) + "\n);")

        return "\n".join(ddl_parts) if ddl_parts else ""
    finally:
        conn.close()
