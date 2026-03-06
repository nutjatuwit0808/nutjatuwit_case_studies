"""
NL2SQL-Lite FastAPI Backend: Secure Inference Pipeline with sqlparse Guardrail.
"""

import os
import re
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from db import execute_readonly
from guardrail import validate_sql
from schema import fetch_ddl

load_dotenv()

app = FastAPI(title="NL2SQL-Lite API")

# Lazy-loaded MLX model
_model = None
_tokenizer = None

SYSTEM_PROMPT = """You are a highly skilled database engineer. Given the table schema, write a valid PostgreSQL query to answer the user's question. Return ONLY the raw SQL query without any markdown formatting or explanations."""

MAX_SELF_CORRECTION_RETRIES = 2


def _strip_sql(text: str) -> str:
    """Remove markdown code fences from model output."""
    text = text.strip()
    match = re.search(r"^```\w*\s*\n?(.*?)\n?```\s*$", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text


def _get_model():
    global _model, _tokenizer
    if _model is None:
        from mlx_lm import load, generate as mlx_generate
        model_path = os.getenv("MLX_MODEL_PATH", "mlx-community/Llama-3.2-3B-Instruct-4bit")
        _model, _tokenizer = load(model_path)
    return _model, _tokenizer


def _generate_sql(question: str, ddl: str, error_hint: str | None = None) -> str:
    """Generate SQL from question + schema using MLX."""
    from mlx_lm import generate

    model, tokenizer = _get_model()
    user_content = f"Schema: {ddl}\nQuestion: {question}"
    if error_hint:
        user_content += f"\n\nPrevious attempt failed with error: {error_hint}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]
    prompt = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=False,
    )
    generated = generate(model, tokenizer, prompt=prompt, max_tokens=256)
    return _strip_sql(generated)


class ChatToSqlRequest(BaseModel):
    question: str
    schema_hint: str | None = None


class ChatToSqlResponse(BaseModel):
    sql: str
    result: list[dict[str, Any]]
    error: str | None = None


@app.post("/api/chat-to-sql", response_model=ChatToSqlResponse)
def chat_to_sql(req: ChatToSqlRequest) -> ChatToSqlResponse:
    """
    Phase 3 Secure Inference Pipeline:
    5.1 Context Injection -> 5.2 LLM -> 5.3 Guardrail -> 5.4 Execute -> 5.5 Self-Correction
    """
    ddl = req.schema_hint if req.schema_hint else fetch_ddl()
    if not ddl:
        raise HTTPException(status_code=503, detail="No schema available")

    error_hint = None
    for attempt in range(MAX_SELF_CORRECTION_RETRIES + 1):
        sql = _generate_sql(req.question, ddl, error_hint)

        # Step 5.3: Guardrail
        ok, reason = validate_sql(sql)
        if not ok:
            raise HTTPException(status_code=400, detail=f"SQL validation failed: {reason}")

        # Step 5.4: Read-only execution
        try:
            result = execute_readonly(sql)
            return ChatToSqlResponse(sql=sql, result=result, error=None)
        except Exception as e:
            error_hint = str(e)
            if attempt >= MAX_SELF_CORRECTION_RETRIES:
                return ChatToSqlResponse(
                    sql=sql,
                    result=[],
                    error=error_hint,
                )

    return ChatToSqlResponse(sql="", result=[], error="Unexpected error")


@app.get("/health")
def health():
    return {"status": "ok"}
