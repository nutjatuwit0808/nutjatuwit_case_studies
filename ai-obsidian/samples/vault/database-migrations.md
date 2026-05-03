---
title: Database Migrations Playbook
---

# Safe Migration Workflow

## Planning
- เขียน migration ให้ backward compatible ก่อน deploy code ใหม่
- แยกขั้น: expand → dual-write → switch read → contract
- มี rollback script หรือ migration ย้อนกลับที่ทดสอบแล้ว

## Zero-downtime
- หลีกเลี่ยง `ALTER TABLE` ที่ lock table นานใน production
- ใช้ online schema change tool เมื่อจำเป็น
- deploy ทีละ instance พร้อม health check

## Data Backfill
- backfill ข้อมูลเป็น batch เล็กๆ เพื่อลด load
- ตรวจ count ก่อนและหลัง backfill
- บันทึก checkpoint ถ้า job ขาดกลางทาง

## Testing
- รัน migration บน staging ที่ข้อมูลใกล้เคียง production
- มี automated test สำหรับ critical query path

## Rollout
- แจ้งทีมก่อน maintenance window ถ้าต้อง downtime จริงๆ
- monitor error rate และ latency หลัง deploy
