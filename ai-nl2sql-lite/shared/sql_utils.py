"""
SQL text utilities: strip markdown, normalize for PostgreSQL.
"""

import re


def strip_markdown_sql(text: str) -> str:
    """
    Remove markdown code fences (```sql ... ```) from SQL text.
    ใช้ทั้ง API inference และ data prep.
    """
    text = text.strip()
    match = re.search(r"^```\w*\s*\n?(.*?)\n?```\s*$", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text


def normalize_sql_for_postgres(sql: str) -> str:
    """
    Convert double-quoted string literals to single-quoted for PostgreSQL.
    LLMs often output "value" but PostgreSQL expects 'value' for strings.
    """
    def repl(m: re.Match) -> str:
        s = m.group(1).replace("'", "''")
        return f"'{s}'"
    return re.sub(r'"([^"]*)"', repl, sql)
