# Instructor Checklist (90 นาที)

## ก่อนเริ่มสอน
- ติดตั้ง Node.js 20+
- รัน `npm install` ที่ root ของ `ai-obsidian`
- copy `.env.example` เป็น `.env` และใส่ `GOOGLE_API_KEY` (ถ้ามี)
- ทดสอบ `npm run dev` แล้วเปิดหน้าเว็บที่ `http://localhost:3000`

## Demo Path
1. อธิบายโครงสร้าง monorepo (`apps/frontend`, `apps/backend`, `packages/*`)
2. กด Ingest โดยใช้ sample vault
3. ถามคำถาม เช่น "ช่วยสรุป RFC workflow"
4. ชี้ให้เห็น citations ที่ mapping กลับไปยัง note path/chunk id
5. ทดลอง summarize endpoint จาก note เดียว

## Fallback Plan
- หากไม่มี Google API key ระบบจะตอบด้วย fallback mode ที่ยังโชว์ retrieval context ได้
- หาก ingest ไม่สำเร็จ ให้ตรวจ path `samples/vault`
- หาก frontend เรียก backend ไม่ได้ ให้เช็ก `NEXT_PUBLIC_API_BASE`
