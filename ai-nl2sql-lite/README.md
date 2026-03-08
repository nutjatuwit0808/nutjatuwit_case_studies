# NL2SQL-Lite

Text-to-SQL system with bilingual (Thai/English) support, LoRA fine-tuned on Apple Silicon (M2 Pro), with SQL injection guardrail and read-only database.

## Table of Contents

- [Technical Stack Summary](#technical-stack-summary)
- [Structure](#structure)
- [1. Flow การทำงานอย่างละเอียด (Detailed System Flow)](#1-flow-การทำงานอย่างละเอียด-detailed-system-flow)
  - [Phase 1 — Data Preparation](#phase-1-data-preparation)
  - [Phase 2 — LoRA Fine-Tuning (Optional)](#phase-2-lora-fine-tuning-optional)
  - [ขีดจำกัด: ไฟล์โมเดลที่เทรนแล้วกับ GitHub](#ขีดจำกัด-ไฟล์โมเดลที่เทรนแล้วกับ-github)
  - [Phase 3 — Inference Pipeline (Secure)](#phase-3-inference-pipeline-secure)
  - [Overall System Flow](#overall-system-flow)
- [2. Pain Points ที่โมเดลนี้ช่วยและต่อยอดได้ (Pain Points & Extensions)](#2-pain-points-ที่โมเดลนี้ช่วยและต่อยอดได้-pain-points--extensions)
- [3. ตัวอย่างการทำงานของ Model (Concrete Examples)](#3-ตัวอย่างการทำงานของ-model-concrete-examples)
- [ขั้นตอนการเตรียมโปรเจค (Project Setup)](#ขั้นตอนการเตรียมโปรเจค-project-setup)
  - [ขั้นตอนที่ 1: สร้าง Read-Only User ใน Database](#ขั้นตอนที่-1-สร้าง-read-only-user-ใน-database)
  - [ขั้นตอนที่ 2: สร้าง Virtual Environment และติดตั้ง Dependencies สำหรับ Data Prep](#ขั้นตอนที่-2-สร้าง-virtual-environment-และติดตั้ง-dependencies-สำหรับ-data-prep)
  - [ขั้นตอนที่ 3: เตรียมข้อมูล (Data Prep)](#ขั้นตอนที่-3-เตรียมข้อมูล-data-prep)
  - [ขั้นตอนที่ 4: LoRA Fine-Tuning (Phase 2 - Optional)](#ขั้นตอนที่-4-lora-fine-tuning-phase-2---optional)
  - [ขั้นตอนที่ 5: ติดตั้ง Dependencies สำหรับ API Backend](#ขั้นตอนที่-5-ติดตั้ง-dependencies-สำหรับ-api-backend)
  - [ขั้นตอนที่ 6: รัน API Server](#ขั้นตอนที่-6-รัน-api-server)
- [เคสตัวอย่างสำหรับทดสอบ](#เคสตัวอย่างสำหรับทดสอบ)
- [สรุปลำดับการรัน](#สรุปลำดับการรัน)

## Technical Stack Summary

| Category | Technologies |
|----------|--------------|
| **Backend** | Python 3.x, FastAPI |
| **ML/Inference** | MLX (Apple Silicon), mlx-lm |
| **Database** | PostgreSQL, Supabase |
| **Libraries** | sqlparse, Pydantic, deep_translator, Hugging Face datasets |
| **DevOps/Tools** | uvicorn, psycopg2 |

---

## Structure

- `shared/` - Shared utilities (prompts, sql_utils) ใช้ร่วมกันระหว่าง api และ data_prep
- `data_prep/` - Data engineering pipeline (sql-create-context + Thai augmentation)
- `api/` - FastAPI inference backend with sqlparse guardrail
  - `main.py` - Entry point, routes
  - `models.py` - Pydantic request/response
  - `config.py` - Constants
  - `db.py`, `schema.py`, `guardrail.py` - DB, DDL, validation
- `migrations/` - PostgreSQL/Supabase read-only user setup
- `scripts/` - Seed schema, test runner
- `tests/` - Test cases (test_cases.json)

---

## 1. Flow การทำงานอย่างละเอียด (Detailed System Flow)

### Phase 1 — Data Preparation

```mermaid
flowchart TD
    A[Download b-mc2/sql-create-context] --> B[Shuffle + Sample 5,000 rows]
    B --> C[Thai Augmentation]
    C --> D[Translate first 1,000 questions via deep_translator GoogleTranslator]
    D --> E[Format Chat Template]
    E --> F[System prompt + user: Schema + Question, assistant: SQL]
    F --> G[Split 80/20]
    G --> H[train.jsonl ~4,000 rows]
    G --> I[valid.jsonl ~1,000 rows]
```

| Step | Description |
|------|-------------|
| 1 | Download `b-mc2/sql-create-context` from Hugging Face |
| 2 | Shuffle and sample 5,000 rows (seed=42) |
| 3 | Thai augmentation: translate first 1,000 questions (20%) using Google Translator (deep_translator) |
| 4 | Format as Chat Template: `<\|system\|>...<\|user\|>Schema: {context}\nQuestion: {question}<\|assistant\|>{sql}` |
| 5 | Split 80/20 → `train.jsonl` and `valid.jsonl` |

---

### Phase 2 — LoRA Fine-Tuning (Optional)

```mermaid
flowchart LR
    A[Base Model: scb10x/llama-3-typhoon-v1.5-8b-instruct] --> B[mlx_lm.lora training]
    B --> C[adapters/ folder]
    C --> D[mlx_lm.fuse]
    D --> E[fused_model/]
    
    style A fill:#e1f5fe
    style E fill:#c8e6c9
```

| Step | Description |
|------|-------------|
| 1 | Base model: `scb10x/llama-3-typhoon-v1.5-8b-instruct` (or 4bit variant for low memory) |
| 2 | `mlx_lm.lora` training on Apple Silicon |
| 3 | Output: `adapters/` (adapters.safetensors, adapter_config.json) |
| 4 | `mlx_lm.fuse` to merge adapter with base model → `fused_model/` |

---

### ขีดจำกัด: ไฟล์โมเดลที่เทรนแล้วกับ GitHub

**โมเดลที่เทรนแล้วไม่สามารถอัปโหลดขึ้น GitHub ได้** เนื่องจากขีดจำกัดขนาดไฟล์ GitHub กำหนดไว้ที่ **100 MB ต่อไฟล์** ขณะที่ไฟล์โมเดลที่ได้จาก Phase 2 (LoRA fine-tuning) มีขนาดเกินขีดจำกัดนี้

#### ไฟล์ที่อัปโหลดไม่ได้

ไฟล์เหล่านี้ถูกสร้างขึ้นระหว่างขั้นตอนการเทรนโมเดล และถูกระบุใน `.gitignore` แล้ว:

| โฟลเดอร์ | ไฟล์ | ขนาดโดยประมาณ | คำอธิบาย |
|----------|------|---------------|----------|
| `adapters/` | `adapters.safetensors` | ~21 MB | ผลลัพธ์จาก `mlx_lm.lora` training |
| `adapters/` | `0000100_adapters.safetensors` … `0001000_adapters.safetensors` | ~21 MB ต่อไฟล์ | ไฟล์ checkpoint จาก LoRA training |
| `fused_model/` | `model.safetensors` | ~4.5 GB | น้ำหนักโมเดลที่ fuse แล้ว (ผลลัพธ์จาก `mlx_lm.fuse`) |
| `fused_model/` | `tokenizer.json` | ขนาดใหญ่ | Tokenizer จากโมเดลที่ fuse แล้ว |

#### แนะนำ

- **เทรนบนเครื่องตัวเอง** — รัน `mlx_lm.lora` และ `mlx_lm.fuse` บนเครื่องของคุณ (ต้องใช้ Apple Silicon)
- **ดาวน์โหลดจากแหล่งอื่น** — ดาวน์โหลดโมเดลที่เทรนหรือ fuse แล้วจาก [Hugging Face Hub](https://huggingface.co/) หรือแหล่งเก็บข้อมูลอื่น (ถ้ามี)
- เส้นทางไฟล์เหล่านี้อยู่ใน `.gitignore` แล้ว จะไม่ถูก commit เข้า repository

---

### Phase 3 — Inference Pipeline (Secure)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant Schema as schema.py
    participant LLM as MLX Model
    participant Guard as guardrail.py
    participant DB as PostgreSQL (nl2sql_readonly)

    C->>API: POST /api/chat-to-sql {question, schema_hint?}
    API->>Schema: fetch_ddl() or use schema_hint
    Schema->>DB: information_schema query (if no hint)
    DB-->>Schema: DDL
    Schema-->>API: DDL string

    loop Self-Correction (max 2 retries)
        API->>LLM: System + "Schema: {ddl}\nQuestion: {question}"
        LLM-->>API: generated SQL
        API->>API: strip_markdown_sql, normalize_sql_for_postgres
        API->>Guard: validate_sql(sql)
        alt Validation fails
            Guard-->>API: (false, reason)
            API-->>C: 400 Bad Request
        else Validation OK
            API->>DB: execute_readonly(sql)
            alt Execution error
                DB-->>API: error
                API->>LLM: retry with error hint
            else Success
                DB-->>API: result rows
                API-->>C: {sql, result, error: null}
            end
        end
    end
```

| Step | Description |
|------|-------------|
| 1. Context Injection | Fetch DDL from PostgreSQL `information_schema` หรือใช้ `schema_hint` จาก request |
| 2. LLM Generation | System prompt + `"Schema: {ddl}\nQuestion: {question}"` → MLX generate |
| 3. Post-process | `strip_markdown_sql`, `normalize_sql_for_postgres` (double-quote → single-quote) |
| 4. Guardrail | sqlparse validation: single SELECT only, no DML/DDL (INSERT, UPDATE, DELETE, DROP, etc.) |
| 5. Execute | `execute_readonly()` with `nl2sql_readonly` user (PostgreSQL read-only) |
| 6. Self-Correction | On execution error, retry with error hint (MAX_SELF_CORRECTION_RETRIES = 2) |

---

### Overall System Flow

```mermaid
flowchart TB
    subgraph Phase1[Phase 1: Data Prep]
        P1A[Hugging Face Dataset] --> P1B[Thai Augmentation]
        P1B --> P1C[train.jsonl / valid.jsonl]
    end

    subgraph Phase2[Phase 2: LoRA Optional]
        P2A[Base Model] --> P2B[mlx_lm.lora]
        P2B --> P2C[adapters/]
        P2C --> P2D[mlx_lm.fuse]
        P2D --> P2E[fused_model/]
    end

    subgraph Phase3[Phase 3: Inference]
        P3A[Question + Schema] --> P3B[LLM Generate]
        P3B --> P3C[Post-process + Guardrail]
        P3C --> P3D[Execute Read-Only]
        P3D --> P3E[Result / Self-Correct]
    end

    P1C -.->|training data| P2B
    P2E -.->|model| P3B
```

---

## 2. Pain Points ที่โมเดลนี้ช่วยและต่อยอดได้ (Pain Points & Extensions)

### Pain Point 1: Business users cannot write SQL

ผู้ใช้ธุรกิจที่ไม่ใช่ technical ไม่สามารถเขียน SQL ได้ แต่ต้องการ query ข้อมูลจากระบบ NL2SQL-Lite ช่วยให้ผู้ใช้ถามได้ด้วยภาษา natural (ไทยหรืออังกฤษ) ได้ผลลัพธ์ทันที

### Pain Point 2: Limited Thai support in NL2SQL

โมเดล NL2SQL ส่วนใหญ่รองรับเฉพาะภาษาอังกฤษ ระบบนี้ใช้ Thai augmentation ใน data prep (แปล 20% ของคำถามเป็นภาษาไทย) ร่วมกับ base model Typhoon ที่รองรับภาษาไทย ทำให้สามารถ query ได้ทั้งไทยและอังกฤษ

### Pain Point 3: Security & SQL Injection

การเชื่อม LLM ตรงกับ database มีความเสี่ยงสูง — โมเดลอาจ generate SQL ที่ไม่ปลอดภัย

**แนวทางแก้ไข:**
- **sqlparse guardrail**: อนุญาตเฉพาะ single SELECT เท่านั้น ไม่มี DML/DDL (INSERT, UPDATE, DELETE, DROP, ALTER, etc.)
- **Read-only DB user**: ใช้ `nl2sql_readonly` ที่ไม่มีสิทธิ์เขียนข้อมูล
- **No DML/DDL**: ไม่มีคำสั่งที่เปลี่ยนแปลงข้อมูล

### Pain Point 4: Cloud API cost

การเรียกใช้ API ฝั่ง cloud (เช่น OpenAI, Anthropic) มีค่าใช้ต่อ query ระบบนี้รันบน Apple Silicon ด้วย MLX ทำให้ประมวลผลได้ on-prem ไม่ต้องใช้ cloud API เหมาะสำหรับ edge deployment

### Pain Point 5: Schema complexity

ผู้ใช้ไม่รู้ชื่อตารางหรือ column ในฐานข้อมูล **Context Injection** ดึง DDL จาก `information_schema` ส่งให้โมเดลเพื่อให้รู้โครงสร้าง schema ทั้งหมด

### ต่อยอดได้ (Extensions)

- เพิ่ม Thai training data มากขึ้น
- รองรับ complex queries (CTE, window functions)
- ผสานกับ BI tools (เช่น Metabase, Superset)
- เพิ่ม caching สำหรับคำถามที่ซ้ำ
- รองรับ multi-turn conversation

---

## 3. ตัวอย่างการทำงานของ Model (Concrete Examples)

Schema ตัวอย่างจาก `scripts/seed_sample_schema.sql`:

```sql
CREATE TABLE t2s_products (id INTEGER, name VARCHAR(100), category VARCHAR(50), price NUMERIC(10, 2));
CREATE TABLE t2s_customers (id INTEGER, name VARCHAR(100), region VARCHAR(50));
CREATE TABLE t2s_sales (id INTEGER, product_id INTEGER, amount NUMERIC(10, 2), sale_date DATE, customer_id INTEGER);
```

---

### ตัวอย่าง 1: รวมยอดขายทั้งหมด (Aggregation SUM)

| ขั้นตอน | ข้อมูล |
|---------|--------|
| **Question** | รวมยอดขายทั้งหมด |
| **Schema** | DDL ด้านบน |
| **Generated SQL** | `SELECT SUM(amount) FROM t2s_sales;` |
| **Result** | `[{"sum": 120302.00}]` |

```
Question → Model → SQL → Result
```

---

### ตัวอย่าง 2: ลูกค้าที่ซื้อ Laptop มีชื่ออะไรบ้าง (JOIN)

| ขั้นตอน | ข้อมูล |
|---------|--------|
| **Question** | ลูกค้าที่ซื้อ Laptop มีชื่ออะไรบ้าง |
| **Schema** | DDL ด้านบน |
| **Generated SQL** | `SELECT DISTINCT c.name FROM t2s_customers c JOIN t2s_sales s ON c.id = s.customer_id JOIN t2s_products p ON s.product_id = p.id WHERE p.name = 'Laptop';` |
| **Result** | `[{"name": "สมชาย ใจดี"}, {"name": "John Smith"}, {"name": "Mary Johnson"}]` |

---

### ตัวอย่าง 3: สินค้าประเภท Electronics มีอะไรบ้าง (Simple SELECT)

| ขั้นตอน | ข้อมูล |
|---------|--------|
| **Question** | สินค้าประเภท Electronics มีอะไรบ้าง |
| **Generated SQL** | `SELECT * FROM t2s_products WHERE category = 'Electronics';` |
| **Result** | Laptop, Mouse, Keyboard, Monitor (4 แถว) |

---

### ตัวอย่าง 4: มีลูกค้ากี่คนในภาคเหนือ (Aggregation COUNT)

| ขั้นตอน | ข้อมูล |
|---------|--------|
| **Question** | มีลูกค้ากี่คนในภาคเหนือ |
| **Generated SQL** | `SELECT COUNT(*) FROM t2s_customers WHERE region = 'ภาคเหนือ';` |
| **Result** | `[{"count": 1}]` (สมชาย ใจดี — region = 'ภาคเหนือ') |

---

### ตัวอย่าง 5: What is the total sales amount? (English)

| ขั้นตอน | ข้อมูล |
|---------|--------|
| **Question** | What is the total sales amount? |
| **Generated SQL** | `SELECT SUM(amount) FROM t2s_sales;` |
| **Result** | `[{"sum": 120302.00}]` |

---

### รูปแบบ Flow แบบย่อ

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Question   │ ──► │    Model    │ ──► │     SQL     │ ──► │   Result    │
│ (Thai/EN)   │     │ (MLX+Typhoon)│     │ (validated) │     │ (from DB)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## ขั้นตอนการเตรียมโปรเจค (Project Setup)

### ขั้นตอนที่ 1: สร้าง Read-Only User ใน Database

เลือกอย่างใดอย่างหนึ่ง: **PostgreSQL (local)** หรือ **Supabase**

#### ตัวเลือก A: PostgreSQL (local)

1. เปิดไฟล์ `migrations/001_nl2sql_readonly.sql` และแก้ไขค่าต่อไปนี้:
   - `CHANGE_ME_IN_PRODUCTION` → รหัสผ่านที่ต้องการสำหรับ user `nl2sql_readonly`
   - `your_database` → ชื่อฐานข้อมูลที่ใช้ (เช่น `postgres`, `nl2sql_db`)

2. รัน migration ด้วย superuser (postgres):

   ```bash
   psql -U postgres -d your_database -f migrations/001_nl2sql_readonly.sql
   ```

3. ตรวจสอบว่า user ถูกสร้างแล้ว: `psql -U postgres -c "\du nl2sql_readonly"`

#### ตัวเลือก B: Supabase

1. เปิดไฟล์ `migrations/002_supabase_readonly.sql` แก้ไข `CHANGE_ME_IN_PRODUCTION` เป็นรหัสผ่านที่ต้องการ

2. เข้า [Supabase Dashboard](https://supabase.com/dashboard) → โปรเจกต์ของคุณ → **SQL Editor**

3. วาง SQL จากไฟล์ migration แล้วกด **Run**

4. สร้าง connection string สำหรับ `nl2sql_readonly`:
   - ไปที่ **Project Settings → Database** เพื่อดู host และ connection info
   - รูปแบบ: `postgresql://nl2sql_readonly:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres?sslmode=require`
   - แทนที่ `[PASSWORD]` ด้วยรหัสผ่านที่ตั้งใน migration
   - แทนที่ `[project-ref]` ด้วย Project Reference ID (เช่น `abcdefghijklmnop` จาก Project URL)
   - **ต้องมี `?sslmode=require`** ท้าย URL (Supabase ใช้ SSL บังคับ)

---

### ขั้นตอนที่ 2: สร้าง Virtual Environment และติดตั้ง Dependencies สำหรับ Data Prep

1. เข้าโฟลเดอร์โปรเจค:

   ```bash
   cd ai-nl2sql-lite
   ```

2. สร้าง virtual environment (แนะนำ):

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate   # macOS/Linux
   # หรือ Windows: .venv\Scripts\activate
   ```

3. ติดตั้ง dependencies สำหรับ Data Prep:

   ```bash
   pip install -r data_prep/requirements.txt
   ```

   หรือติดตั้งเฉพาะในโฟลเดอร์ data_prep:

   ```bash
   cd data_prep
   pip install -r requirements.txt
   cd ..
   ```

---

### ขั้นตอนที่ 3: เตรียมข้อมูล (Data Prep)

1. รันสคริปต์เตรียมข้อมูล (ต้องมี internet สำหรับดาวน์โหลด dataset และแปลภาษา):

   ```bash
   python3 data_prep/prepare_dataset.py
   ```

   หรือถ้าอยู่ในโฟลเดอร์ data_prep:

   ```bash
   cd data_prep
   python3 prepare_dataset.py
   cd ..
   ```

2. ตรวจสอบผลลัพธ์: ไฟล์ `data/train.jsonl` และ `data/valid.jsonl` จะถูกสร้างขึ้น
   - `train.jsonl` ประมาณ 4,000 แถว (80%)
   - `valid.jsonl` ประมาณ 1,000 แถว (20%)

3. หมายเหตุ: การแปล 1,000 แถวเป็นภาษาไทยใช้เวลาประมาณ 8–10 นาที (delay 0.5 วินาทีต่อแถวเพื่อป้องกัน IP ban)

---

### ขั้นตอนที่ 4: LoRA Fine-Tuning (Phase 2 - Optional)

ถ้าต้องการ fine-tune โมเดลด้วยข้อมูลที่เตรียมไว้:

> **หมายเหตุ:** ไฟล์ที่ได้จาก LoRA training และ fuse ไม่สามารถอัปโหลดไปยัง GitHub ได้ (เกินขีดจำกัด 100 MB ต่อไฟล์) — ดูรายละเอียดที่ [ขีดจำกัด: ไฟล์โมเดลที่เทรนแล้วกับ GitHub](#ขีดจำกัด-ไฟล์โมเดลที่เทรนแล้วกับ-github)

1. ติดตั้ง mlx และ mlx-lm (ต้องอยู่ใน virtual environment — ดูขั้นตอนที่ 2):

   ```bash
   source .venv/bin/activate   # เปิด venv ก่อน (ถ้ายังไม่ได้เปิด)
   pip install mlx mlx-lm
   ```

   **หมายเหตุ:**
   - หากพบ `command not found: pip` ให้ใช้ `pip3` หรือ `python3 -m pip` แทน
   - หากพบ `externally-managed-environment` (PEP 668) แสดงว่ากำลังใช้ Python ของระบบ — ให้สร้างและเปิด venv ก่อน: `python3 -m venv .venv` แล้ว `source .venv/bin/activate`

2. รัน LoRA training (ต้องใช้ Apple Silicon):

   ผลลัพธ์จะถูกบันทึกในโฟลเดอร์ `adapters/` (adapters.safetensors, adapter_config.json)

   ```bash
   mlx_lm.lora \
     --model scb10x/llama-3-typhoon-v1.5-8b-instruct \
     --train --data data \
     --batch-size 1 \
     --num-layers 8 \
     --iters 1000 \
     --learning-rate 1e-4 \
     --grad-checkpoint
   ```

   **หากพบ `Insufficient Memory` หรือ `Out of Memory`** — ใช้โมเดล 4-bit ที่ใช้หน่วยความจำน้อยกว่า (~1/4):

   ```bash
   mlx_lm.lora \
     --model mlx-community/typhoon-v1.5-8b-instruct-4bit-mlx \
     --train --data data \
     --batch-size 1 \
     --num-layers 8 \
     --iters 1000 \
     --learning-rate 1e-4 \
     --grad-checkpoint
   ```

   (ขั้นตอน fuse ใช้ `--model mlx-community/typhoon-v1.5-8b-instruct-4bit-mlx` ด้วย)

3. รวม Adapter เข้ากับ Base Model:

   ```bash
   mlx_lm.fuse --model scb10x/llama-3-typhoon-v1.5-8b-instruct --adapter-path adapters
   ```

---

### ขั้นตอนที่ 5: ติดตั้ง Dependencies สำหรับ API Backend

1. ติดตั้ง dependencies สำหรับ FastAPI (ต้องเปิด venv ก่อน — ดูขั้นตอนที่ 2):

   ```bash
   source .venv/bin/activate   # เปิด venv ก่อน (ถ้ายังไม่ได้เปิด)
   pip install -r api/requirements.txt
   ```

   หรือถ้าอยู่ในโฟลเดอร์ api:

   ```bash
   cd api
   pip install -r requirements.txt
   cd ..
   ```

   หากพบ `command not found: pip` ให้ใช้ `pip3` หรือ `python3 -m pip` แทน

2. คัดลอกไฟล์ env และแก้ไข:

   ```bash
   cp api/.env.example api/.env
   ```

   หรือใช้ `api/.env.local` สำหรับค่าท้องถิ่น (จะ override ค่าใน `.env`)

3. แก้ไข `api/.env` หรือ `api/.env.local`:
   - `DATABASE_URL_READONLY`: connection string ของ user `nl2sql_readonly`
     - PostgreSQL: `postgresql://nl2sql_readonly:PASSWORD@localhost:5432/your_database`
     - Supabase: `postgresql://postgres.[ref]:PASSWORD@...pooler.supabase.com:6543/postgres?sslmode=require` (ต้องมี `?sslmode=require`)
   - `MLX_MODEL_PATH`: path โมเดลที่ fuse แล้ว หรือ Hugging Face ID (เช่น `../fused_model`)

---

### ขั้นตอนที่ 6: รัน API Server

1. เข้าโฟลเดอร์ api:

   ```bash
   cd api
   ```

2. รัน FastAPI server:

   ```bash
   python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   หรือใช้ uvicorn โดยตรง:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. ตรวจสอบ API:
   - Health: `curl http://localhost:8000/health`
   - Chat-to-SQL: `curl -X POST http://localhost:8000/api/chat-to-sql -H "Content-Type: application/json" -d '{"question": "รวมยอดขายทั้งหมด"}'`

---

## เคสตัวอย่างสำหรับทดสอบ

### เตรียม Database (สำหรับ E2E)

รัน seed schema เพื่อสร้างตารางตัวอย่าง (t2s_products, t2s_sales, t2s_customers):

```bash
psql -U postgres -d your_database -f scripts/seed_sample_schema.sql
```

หรือใน Supabase: เปิด **SQL Editor** แล้ววางเนื้อหาจาก `scripts/seed_sample_schema.sql` แล้วกด Run

### ตารางเคสทดสอบ

| # | หมวด | คำถาม (ไทย) | คำถาม (English) |
|---|------|-------------|-----------------|
| 1 | Simple SELECT | สินค้าประเภท Electronics มีอะไรบ้าง | What products are in the Electronics category? |
| 2 | Aggregation SUM | รวมยอดขายทั้งหมด | What is the total sales amount? |
| 3 | Aggregation COUNT | มีลูกค้ากี่คนในภาคเหนือ | How many customers are in the North region? |
| 4 | Aggregation AVG | ราคาเฉลี่ยของสินค้าเท่าไหร่ | What is the average price of products? |
| 5 | MIN/MAX | ยอดขายสูงสุดคือเท่าไหร่ | What is the maximum sales amount? |
| 6 | JOIN | ลูกค้าที่ซื้อ Laptop มีชื่ออะไรบ้าง | What are the names of customers who bought Laptop? |
| 7 | GROUP BY | ยอดขายแยกตามประเภทสินค้า | What is the sales amount by product category? |
| 8 | ORDER BY | สินค้าราคาสูงสุด 5 อันดับ | What are the top 5 most expensive products? |
| 9 | Subquery | สินค้าที่ราคาสูงกว่าค่าเฉลี่ยมีอะไรบ้าง | Which products have a price above the average? |

### ตัวอย่างคำสั่ง curl

**โหมด A — ใช้ schema จาก DB** (ต้องรัน seed ก่อน):

```bash
# เคส 1: Simple SELECT (ไทย)
curl -X POST http://localhost:8000/api/chat-to-sql \
  -H "Content-Type: application/json" \
  -d '{"question": "สินค้าประเภท Electronics มีอะไรบ้าง"}'

# เคส 2: Aggregation SUM (ไทย)
curl -X POST http://localhost:8000/api/chat-to-sql \
  -H "Content-Type: application/json" \
  -d '{"question": "รวมยอดขายทั้งหมด"}'

# เคส 3: Aggregation COUNT (ไทย)
curl -X POST http://localhost:8000/api/chat-to-sql \
  -H "Content-Type: application/json" \
  -d '{"question": "มีลูกค้ากี่คนในภาคเหนือ"}'

# เคส 4: JOIN (ไทย)
curl -X POST http://localhost:8000/api/chat-to-sql \
  -H "Content-Type: application/json" \
  -d '{"question": "ลูกค้าที่ซื้อ Laptop มีชื่ออะไรบ้าง"}'

# เคส 5: English
curl -X POST http://localhost:8000/api/chat-to-sql \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the total sales amount?"}'
```

**โหมด B — ใช้ schema_hint** (ทดสอบ SQL generation ได้แม้ DB จะไม่มีตาราง):

```bash
curl -X POST http://localhost:8000/api/chat-to-sql \
  -H "Content-Type: application/json" \
  -d '{
    "question": "รวมยอดขายทั้งหมด",
    "schema_hint": "CREATE TABLE t2s_sales (id INTEGER, product_id INTEGER, amount NUMERIC, sale_date DATE, customer_id INTEGER); CREATE TABLE t2s_products (id INTEGER, name VARCHAR, category VARCHAR, price NUMERIC); CREATE TABLE t2s_customers (id INTEGER, name VARCHAR, region VARCHAR);"
  }'
```

### รันทดสอบอัตโนมัติ

```bash
./scripts/run_tests.sh
```

(ต้องรัน API server อยู่ก่อน: `cd api && uvicorn main:app --reload`)

---

## สรุปลำดับการรัน

| ลำดับ | ขั้นตอน | คำสั่งหลัก |
|-------|---------|------------|
| 1 | สร้าง Read-Only User | PostgreSQL: `psql ... -f migrations/001_nl2sql_readonly.sql` / Supabase: รัน `migrations/002_supabase_readonly.sql` ใน SQL Editor |
| 2 | ติดตั้ง Data Prep deps | `pip install -r data_prep/requirements.txt` |
| 3 | เตรียมข้อมูล | `python3 data_prep/prepare_dataset.py` |
| 4 | (Optional) LoRA Fine-Tuning | `mlx_lm.lora ...` แล้ว `mlx_lm.fuse ...` |
| 5 | ติดตั้ง API deps | `pip install -r api/requirements.txt` |
| 6 | รัน API | `cd api && python3 -m uvicorn main:app --reload` |
