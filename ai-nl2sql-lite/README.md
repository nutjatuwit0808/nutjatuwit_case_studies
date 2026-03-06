# NL2SQL-Lite

Text-to-SQL system with bilingual (Thai/English) support, LoRA fine-tuned on Apple Silicon (M2 Pro), with SQL injection guardrail and read-only database.

## Structure

- `data_prep/` - Data engineering pipeline (sql-create-context + Thai augmentation)
- `api/` - FastAPI inference backend with sqlparse guardrail
- `migrations/` - PostgreSQL read-only user setup

---

## ขั้นตอนการเตรียมโปรเจค (Project Setup)

### ขั้นตอนที่ 1: สร้าง Read-Only User ใน PostgreSQL

1. เปิดไฟล์ `migrations/001_nl2sql_readonly.sql` และแก้ไขค่าต่อไปนี้:
   - `CHANGE_ME_IN_PRODUCTION` → รหัสผ่านที่ต้องการสำหรับ user `nl2sql_readonly`
   - `your_database` → ชื่อฐานข้อมูลที่ใช้ (เช่น `postgres`, `nl2sql_db`)

2. รัน migration ด้วย superuser (postgres):

   ```bash
   psql -U postgres -d your_database -f migrations/001_nl2sql_readonly.sql
   ```

   หรือถ้าอยู่ในโฟลเดอร์ `ai-nl2sql-lite`:

   ```bash
   psql -U postgres -d your_database -f ai-nl2sql-lite/migrations/001_nl2sql_readonly.sql
   ```

3. ตรวจสอบว่า user ถูกสร้างแล้ว:

   ```bash
   psql -U postgres -c "\du nl2sql_readonly"
   ```

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

1. ติดตั้ง mlx และ mlx-lm:

   ```bash
   pip install mlx mlx-lm
   ```

2. รัน LoRA training (ต้องใช้ Apple Silicon):

   ```bash
   mlx_lm.lora \
     --model scb10x/llama-3-typhoon-v1.5-8b-instruct \
     --train --data data \
     --batch-size 2 \
     --lora-layers 16 \
     --iters 1000 \
     --learning-rate 1e-4
   ```

3. รวม Adapter เข้ากับ Base Model:

   ```bash
   mlx_lm.fuse --model scb10x/llama-3-typhoon-v1.5-8b-instruct --adapter-path adapters
   ```

---

### ขั้นตอนที่ 5: ติดตั้ง Dependencies สำหรับ API Backend

1. ติดตั้ง dependencies สำหรับ FastAPI:

   ```bash
   pip install -r api/requirements.txt
   ```

   หรือถ้าอยู่ในโฟลเดอร์ api:

   ```bash
   cd api
   pip install -r requirements.txt
   cd ..
   ```

2. คัดลอกไฟล์ env และแก้ไข:

   ```bash
   cp api/.env.example api/.env
   ```

3. แก้ไข `api/.env`:
   - `DATABASE_URL_READONLY`: ใช้ connection string ของ user `nl2sql_readonly` ที่สร้างในขั้นตอนที่ 1
   - `MLX_MODEL_PATH`: path โมเดลที่ fuse แล้ว หรือ Hugging Face ID (เช่น `mlx-community/Llama-3.2-3B-Instruct-4bit`)

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

## สรุปลำดับการรัน

| ลำดับ | ขั้นตอน | คำสั่งหลัก |
|-------|---------|------------|
| 1 | สร้าง Read-Only User | `psql -U postgres -d your_database -f migrations/001_nl2sql_readonly.sql` |
| 2 | ติดตั้ง Data Prep deps | `pip install -r data_prep/requirements.txt` |
| 3 | เตรียมข้อมูล | `python3 data_prep/prepare_dataset.py` |
| 4 | (Optional) LoRA Fine-Tuning | `mlx_lm.lora ...` แล้ว `mlx_lm.fuse ...` |
| 5 | ติดตั้ง API deps | `pip install -r api/requirements.txt` |
| 6 | รัน API | `cd api && python3 -m uvicorn main:app --reload` |
