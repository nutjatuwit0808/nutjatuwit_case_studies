"""
Pydantic models for NL2SQL-Lite API.
"""

from typing import Any

from pydantic import BaseModel


class ChatToSqlRequest(BaseModel):
    question: str
    schema_hint: str | None = None


class ChatToSqlResponse(BaseModel):
    sql: str
    result: list[dict[str, Any]]
    error: str | None = None
