---
title: API Design Guidelines
---

# REST API Design

## Versioning
- ใส่ major version ใน URL เช่น `/v1/resources`
- หลีกเลี่ยง breaking change ใน minor release
- deprecate endpoint เก่าอย่างชัดเจนใน response header

## Idempotency
- `GET` และ `DELETE` ควร idempotent เสมอ
- `POST` ที่สร้างทรัพยากรซ้ำได้ใช้ `Idempotency-Key` header
- เก็บ idempotency record ชั่วคราวตาม TTL ที่เหมาะสม

## Pagination
- ใช้ cursor-based pagination สำหรับชุดข้อมูลใหญ่
- กำหนด `limit` สูงสุดต่อ request
- ส่ง `next_cursor` กลับเมื่อยังมีหน้าถัดไป

## Errors
- ใช้รูปแบบ error body เดียวกันทั้งระบบ
- ใส่ `code` ที่ client นำไปแยกประเภทได้
- ไม่เปิดเผย stack trace ให้ client ภายนอก

## Security Headers
- บังคับ HTTPS สำหรับ production
- พิจารณา rate limit ต่อ IP และต่อ API key
