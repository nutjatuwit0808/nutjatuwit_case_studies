---
title: Code Review Checklist
---

# Pull Request Review

## Scope
- PR เล็กลง review ได้เร็วและลดความเสี่ยง
- แยก refactor ออกจาก feature ถ้าเป็นไปได้
- ใส่คำอธิบาย context และ link ticket ใน description

## Correctness
- logic ตรงกับ requirement และ edge case
- ไม่มี race condition ที่น่าสงสัย
- error path จัดการครบ

## Tests
- มี unit test หรือ integration test สำหรับ logic ใหม่
- test ไม่ flaky และไม่พึ่งเวลาแบบ fragile

## Readability
- ชื่อตัวแปรและฟังก์ชันสื่อความหมาย
- comment เฉพาะที่ “ทำไม” ไม่ใช่ “ทำอะไร” ที่โค้ดบอกอยู่แล้ว

## Performance
- ไม่มี N+1 query โดยไม่จำเป็น
- ไม่โหลดข้อมูลใหญ่เกินจำเป็นเข้า memory

## Security
- ไม่ log secret หรือ PII แบบ raw
- validate input จาก client และ boundary ระหว่าง service
