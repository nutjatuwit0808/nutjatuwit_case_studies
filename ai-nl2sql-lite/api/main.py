"""
NL2SQL-Lite FastAPI Backend: Secure Inference Pipeline with sqlparse Guardrail.
"""

import os
import sys
import traceback
from pathlib import Path

# เพิ่ม project root เพื่อ import shared package
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import MAX_SELF_CORRECTION_RETRIES
from db import execute_readonly
from guardrail import validate_sql
from models import ChatToSqlRequest, ChatToSqlResponse
from schema import fetch_ddl, fetch_tables
from shared.prompts import SYSTEM_PROMPT
from shared.sql_utils import normalize_sql_for_postgres, strip_markdown_sql

load_dotenv()
load_dotenv(".env.local")  # local overrides (e.g. Supabase, fused_model)

app = FastAPI(title="NL2SQL-Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-loaded MLX model
_model = None
_tokenizer = None


def _get_model() -> tuple[Any, Any]:
    """Lazy load MLX model and tokenizer."""
    global _model, _tokenizer
    if _model is None:
        from mlx_lm import load
        model_path = os.getenv("MLX_MODEL_PATH", "mlx-community/Llama-3.2-3B-Instruct-4bit")
        _model, _tokenizer = load(model_path)
    return _model, _tokenizer


def _generate_sql(user_content: str) -> str:
    """Generate SQL from user content using MLX."""
    from mlx_lm import generate

    model, tokenizer = _get_model()
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
    return strip_markdown_sql(generated)


def _build_error_response(
    sql: str, error: str, system_prompt: str | None = None, user_prompt: str | None = None
) -> ChatToSqlResponse:
    """สร้าง response เมื่อ execution ล้มเหลวหลัง retries ครบ."""
    return ChatToSqlResponse(
        sql=sql, result=[], error=error,
        system_prompt=system_prompt, user_prompt=user_prompt,
    )


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
        user_content = f"Schema: {ddl}\nQuestion: {req.question}"
        if error_hint:
            user_content += f"\n\nPrevious attempt failed with error: {error_hint}"

        sql = _generate_sql(user_content)
        sql = normalize_sql_for_postgres(sql)

        # Step 5.3: Guardrail
        ok, reason = validate_sql(sql)
        if not ok:
            raise HTTPException(status_code=400, detail=f"SQL validation failed: {reason}")

        # Step 5.4: Read-only execution
        try:
            result = execute_readonly(sql)
            return ChatToSqlResponse(
                sql=sql, result=result, error=None,
                system_prompt=SYSTEM_PROMPT, user_prompt=user_content,
            )
        except Exception as e:
            error_hint = str(e)
            if attempt >= MAX_SELF_CORRECTION_RETRIES:
                return _build_error_response(
                    sql, error_hint,
                    system_prompt=SYSTEM_PROMPT, user_prompt=user_content,
                )

    return _build_error_response("", "Unexpected error")


@app.get("/api/schema")
def get_schema():
    """Return list of tables with columns for frontend."""
    try:
        tables = fetch_tables()
        return {"tables": tables}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
def _handle_unhandled(request, exc: Exception):
    """Surface unhandled errors for debugging (returns 500 with detail)."""
    if isinstance(exc, HTTPException):
        raise exc
    tb = traceback.format_exc()
    print(tb, flush=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": tb.split("\n")[-4:]},
    )
