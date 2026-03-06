#!/usr/bin/env python3
"""
NL2SQL-Lite Data Prep: Download b-mc2/sql-create-context, augment with Thai,
format as Chat Template, and export train.jsonl / valid.jsonl.
"""

import json
import re
import time
from pathlib import Path

from datasets import load_dataset
from deep_translator import GoogleTranslator


SYSTEM_PROMPT = """You are a highly skilled database engineer. Given the table schema, write a valid PostgreSQL query to answer the user's question. Return ONLY the raw SQL query without any markdown formatting or explanations."""

USER_TEMPLATE = """Schema: {context}
Question: {question}"""

ASSISTANT_TEMPLATE = "{answer}"

CHAT_TEMPLATE = """<|system|>
{system}
<|user|>
{user}
<|assistant|>
{assistant}"""

# Config
SAMPLE_SIZE = 5000
THAI_AUGMENTATION_RATIO = 0.2  # 20% = 1000 rows
THAI_COUNT = int(SAMPLE_SIZE * THAI_AUGMENTATION_RATIO)
TRAIN_RATIO = 0.8
TRANSLATION_DELAY_SEC = 0.5
RANDOM_SEED = 42


def strip_markdown(text: str) -> str:
    """Remove markdown code fences (```sql ... ```) from SQL text."""
    text = text.strip()
    # Remove ```sql ... ``` or ``` ... ```
    pattern = r"^```\w*\s*\n?(.*?)\n?```\s*$"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text


def format_chat_text(context: str, question: str, answer: str) -> str:
    """Build chat template text for MLX training."""
    user_content = USER_TEMPLATE.format(context=context, question=question)
    assistant_content = strip_markdown(answer)
    return CHAT_TEMPLATE.format(
        system=SYSTEM_PROMPT,
        user=user_content,
        assistant=assistant_content,
    )


def translate_to_thai(question: str) -> str | None:
    """Translate English question to Thai. Returns None on failure."""
    try:
        translator = GoogleTranslator(source="en", target="th")
        return translator.translate(question)
    except Exception:
        return None


def main():
    output_dir = Path(__file__).parent.parent / "data"
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Loading b-mc2/sql-create-context from Hugging Face...")
    data = load_dataset("b-mc2/sql-create-context", split="train")
    if not data:
        raise RuntimeError("Dataset is empty")

    print(f"Shuffling and sampling {SAMPLE_SIZE} rows (seed={RANDOM_SEED})...")
    shuffled = data.shuffle(seed=RANDOM_SEED)
    sampled = shuffled.select(range(min(SAMPLE_SIZE, len(shuffled))))

    # Collect indices for Thai augmentation (first 1000 of shuffled sample)
    thai_indices = set(range(THAI_COUNT))

    rows = []
    for i, row in enumerate(sampled):
        question = row["question"]
        context = row["context"]
        answer = row["answer"]

        if i in thai_indices:
            thai_question = translate_to_thai(question)
            if thai_question is not None:
                question = thai_question
            time.sleep(TRANSLATION_DELAY_SEC)

        text = format_chat_text(context, question, answer)
        rows.append({"text": text})

    # Split 80/20
    split_idx = int(len(rows) * TRAIN_RATIO)
    train_rows = rows[:split_idx]
    valid_rows = rows[split_idx:]

    train_path = output_dir / "train.jsonl"
    valid_path = output_dir / "valid.jsonl"

    print(f"Writing {len(train_rows)} rows to {train_path}...")
    with open(train_path, "w", encoding="utf-8") as f:
        for row in train_rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(f"Writing {len(valid_rows)} rows to {valid_path}...")
    with open(valid_path, "w", encoding="utf-8") as f:
        for row in valid_rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    print("Done.")


if __name__ == "__main__":
    main()
