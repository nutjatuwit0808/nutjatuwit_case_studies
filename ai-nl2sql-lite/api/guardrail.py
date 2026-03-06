"""
SQL Guardrail: Validate generated SQL using sqlparse.
Only allows single SELECT statements. Blocks DML/DDL and SQL injection patterns.
"""

import sqlparse
from sqlparse.sql import Statement
from sqlparse.tokens import Keyword, DML, DDL

FORBIDDEN_KEYWORDS = frozenset({
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE",
    "GRANT", "REVOKE", "CREATE", "EXECUTE", "EXEC", "CALL",
})


def _collect_keywords(statement: Statement) -> set[str]:
    """Extract all SQL keywords from a parsed statement."""
    keywords = set()
    for token in statement.flatten():
        if token.ttype in (Keyword, DML, DDL):
            keywords.add(token.value.upper())
    return keywords


def validate_sql(sql: str) -> tuple[bool, str]:
    """
    Validate SQL for safety. Returns (pass, reason).
    - Rule 1: Exactly one statement (no ; injection)
    - Rule 2: Statement must be SELECT
    - Rule 3: No forbidden DML/DDL keywords
    """
    sql = sql.strip()
    if not sql:
        return False, "Empty SQL"

    statements = sqlparse.parse(sql)
    if len(statements) != 1:
        return False, "Multiple statements not allowed"

    stmt = statements[0]
    stmt_type = stmt.get_type()
    if stmt_type != "SELECT":
        return False, f"Only SELECT allowed, got: {stmt_type or 'UNKNOWN'}"

    keywords = _collect_keywords(stmt)
    forbidden_found = keywords & FORBIDDEN_KEYWORDS
    if forbidden_found:
        return False, f"Forbidden keywords: {', '.join(sorted(forbidden_found))}"

    return True, ""
