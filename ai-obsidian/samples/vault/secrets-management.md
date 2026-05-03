---
title: Secrets Management
---

# Handling Secrets in Production

## Storage
- ไม่ commit secret ลง git repository
- ใช้ secret manager เช่น KMS หรือ cloud secret store
- แยก secret ตาม environment: dev, staging, production

## Rotation
- กำหนดรอบ rotation สำหรับ API key และ database password
- รองรับ dual-key ช่วงเปลี่ยน key เพื่อไม่ให้ downtime
- บันทึก audit log เมื่อมีการอ่านหรือ rotate secret

## Runtime
- โหลด secret เมื่อ process start หรือตาม cache TTL
- ไม่ print secret ใน log แม้ใน debug mode บน production

## Access Control
- least privilege: service account ได้เฉพาะ secret ที่จำเป็น
- แยก role สำหรับ human break-glass access

## Incident
- ถ้า secret leak ให้ revoke ทันทีและออก key ใหม่
- ตรวจสอบว่า leak ไปถึง commit history หรือ artifact ใดบ้าง
