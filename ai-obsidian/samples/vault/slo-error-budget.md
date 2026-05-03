---
title: SLO and Error Budget
---

# Service Level Objectives

## Definitions
- **SLI** คือตัววัดที่สะท้อนประสบการณ์ผู้ใช้ เช่น latency หรือ success rate
- **SLO** คือเป้าหมายของ SLI ในช่วงเวลา เช่น availability 99.9% ต่อเดือน
- **Error budget** คือส่วนที่ “ยอมให้พลาดได้” ก่อนจะถือว่าเสีย SLO

## Error Budget Policy
- เมื่อใช้ error budget เกินครึ่ง ชะลอ feature ใหม่และโฟกัส stability
- เมื่อหมด error budget พิจารณา freeze release หรือ incident review
- แจ้งทีม product และ engineering ด้วยข้อมูลเดียวกัน

## Alerting
- alert จาก symptom ที่ user เจอ ไม่ใช่แค่ internal metric เปล่าๆ
- ลด false positive เพื่อไม่ให้ทีมชินกับการ ignore alert
- มี runbook ลิงก์จาก alert ไปยังขั้นตอนแก้เบื้องต้น

## Measurement
- เก็บ SLI จาก edge หรือ client ที่เป็นตัวแทนจริง
- แยก metric ตาม region และ critical path

## Review Cadence
- ทบทวน SLO รายไตรมาสหรือเมื่อ architecture เปลี่ยนมาก
- บันทึกการ trade-off เมื่อปรับ threshold
