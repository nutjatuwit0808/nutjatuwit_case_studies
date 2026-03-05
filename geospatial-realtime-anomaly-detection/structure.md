# Geo-Stream: Real-time Anomaly Detection - Project Structure

## Overview

Event-Driven Architecture สำหรับตรวจจับความผิดปกติของพิกัด GPS รถบรรทุกแบบ Real-time ประกอบด้วย 5 คอมโพเนนต์หลัก: Generator, Apache Kafka, Python AI Service, NestJS Gateway, Next.js Dashboard

## Directory Structure

```
geospatial-realtime-anomaly-detection/
├── generator/                 # Producer - Mock GPS data
│   ├── main.py                # สร้างและส่ง GPS pings ไป Kafka
│   ├── config.py             # จำนวนรถ, interval, broker URL, bounds
│   └── requirements.txt
├── ai-service/               # Python ML microservice
│   ├── lib/
│   │   ├── __init__.py
│   │   └── kafka_helpers.py  # create_consumer, create_producer, parse_json_message
│   ├── main.py               # Kafka consumer + anomaly detection loop
│   ├── anomaly_detector.py   # Sliding window, Isolation Forest, rule-based
│   ├── config.py
│   └── requirements.txt
├── gateway/                  # NestJS backend
│   ├── src/
│   │   ├── config/
│   │   │   └── constants.ts  # TOPIC_GPS, TOPIC_ALERTS, getKafkaBrokers
│   │   ├── kafka/
│   │   │   ├── kafka.module.ts
│   │   │   └── kafka.service.ts
│   │   ├── websocket/
│   │   │   ├── websocket.gateway.ts
│   │   │   └── websocket.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── dashboard/                # Next.js + Mapbox frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── VehicleMap.tsx
│   │   ├── AlertToast.tsx
│   │   ├── ConnectionStatus.tsx
│   │   └── MapErrorOverlay.tsx
│   ├── hooks/
│   │   ├── useMapboxMap.ts
│   │   └── useWebSocket.ts
│   ├── lib/
│   │   ├── map-config.ts
│   │   ├── constants.ts      # DEFAULT_WS_URL, ALERT_RETENTION, MARKER_COLOR
│   │   └── marker-helpers.ts # createVehicleMarkerElement, updateMarkerStyle
│   ├── types/
│   │   └── websocket.ts      # GpsUpdate, AlertPayload
│   └── package.json
├── docker-compose.yml        # Kafka + Zookeeper
├── structure.md
├── README.md
└── .env.example
```

## Kafka Topics

| Topic | Purpose | Partition Key |
|-------|---------|---------------|
| `vehicle-gps-stream` | GPS pings จาก Generator | `vehicle_id` |
| `vehicle-alerts` | Anomaly alerts จาก AI Service | - |

## Data Flow

```
Generator → vehicle-gps-stream → AI Service (consume, detect) → vehicle-alerts
                ↓                           ↓
            Gateway (consume both) → WebSocket → Dashboard
```

## Key Dependencies

| Component | Dependencies |
|-----------|--------------|
| Generator | confluent-kafka |
| AI Service | confluent-kafka, scikit-learn, numpy |
| Gateway | @nestjs/core, kafkajs, @nestjs/websockets, socket.io |
| Dashboard | next, react, mapbox-gl, socket.io-client |
