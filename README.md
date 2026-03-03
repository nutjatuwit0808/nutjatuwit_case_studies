# 🚀 Engineering Case Studies & Architecture Showcase

[![Portfolio](https://img.shields.io/badge/Website-My_Portfolio-000000?style=for-the-badge&logo=vercel)](https://your-portfolio-link.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/nutjatuwit0808)

Welcome to my engineering showcase! I'm **Jatuwit Pitukdansakul**, a Mid-Senior Full Stack Developer transitioning into an AI Engineer role. 

This repository serves as a deep dive into my technical problem-solving process. Due to Non-Disclosure Agreements (NDAs), I cannot share the exact source code of the enterprise applications I've built. Instead, I have recreated **mock architectures, core logic snippets, and case studies** based on real-world challenges I've successfully resolved.

---

## 📂 Featured Case Studies

Here is a curated list of architectural challenges and optimizations I have engineered:

### 1. [Geospatial Comparison](./geospatial-comparison)
**Domain:** GIS / Geospatial Web Performance
**คำอธิบาย:** เปรียบเทียบ performance การโหลดแผนที่ระหว่าง GeoJSON และ PMTiles บน Mapbox GL JS แบบ side-by-side พร้อม metrics (load time, file size, time to first paint) และการประมาณเวลาโหลดตามความเร็วเครือข่าย (3G/4G/WiFi)
**Tech:** Next.js 16, React 19, Mapbox GL JS, mapbox-pmtiles, Tailwind CSS 4, GeoJSON, PMTiles

### 2. [Geospatial Data Pipeline](./geospatial-data-pipeline)
**Domain:** GIS / Data Pipeline
**คำอธิบาย:** Pipeline สำหรับสร้างข้อมูลอสังหาริมทรัพย์จำลอง 10,000 จุดทั่วประเทศไทย และแปลง GeoJSON เป็น PMTiles ด้วย tippecanoe เพื่อใช้ร่วมกับ geospatial-comparison
**Tech:** Python, GeoPandas, pandas, numpy, pyarrow, tippecanoe, GeoJSON, PMTiles

---

## 🛠️ Core Technology Stack Demonstrated Here

* **Languages:** JavaScript (ES6+), TypeScript, Python
* **Frontend:** React.js, Next.js, Mapbox GL JS, Tailwind CSS
* **Geospatial:** GeoJSON, PMTiles, mapbox-pmtiles, GeoPandas, tippecanoe
* **Data Processing:** pandas, numpy, pyarrow, GeoJSON manipulation
* **Backend:** Node.js, Next.js API Routes

---

## 💡 How to navigate this repository
Each folder represents a standalone case study. Inside, you will find a dedicated `README.md` explaining the context, accompanied by mock code snippets (`.js`, `.ts`, `.py`) and architectural diagrams to illustrate the implemented solutions.

> *Note: All code provided in this repository has been abstracted and rewritten to demonstrate concepts without exposing proprietary business logic.*

---
📫 **Get in touch:** nutjatuwit.dev@gmail.com
