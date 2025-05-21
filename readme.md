# 📡 Fitbit IoT 실시간 모니터링 시스템

📎 이전 EC2/S3 기반 구현 방식은 [before.md](before.md) 파일 참고

**Fitbit + Raspberry Pi + MQTT + AWS IoT Core + AWS Lambda + DynamoDB + API Gateway + React Web UI**

---

## 📁 폴더 구조

```
fitbit-iot/
├── raspberrypi/
│   ├── sensor_mqtt.py
│   └── config.json
├── server/                   # (비활성) 기존 EC2/S3 코드 보관용
├── lambda/
│   ├── handler.py
│   └── requirements.txt
├── src/
│   ├── api/
│   │   └── sensor.ts
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
```

---

## 데이터 흐름

```
[라즈베리파이] → (MQTT → AWS IoT Core) → Lambda (IoT Rule)
                            ↓
                    API Gateway (GET/POST)
                            ↓
                     React Web UI fetch
```

---

## 📌 주요 기능 요약

| 기능                        | 설명 |
|-----------------------------|------|
| ✅ MQTT → IoT Core 자동 처리 | 라즈베리파이에서 IoT Core로 센서 데이터 전송 |
| ✅ Lambda 저장 및 조회       | Lambda → DynamoDB 저장 및 API Gateway 응답 |
| ✅ Serverless Web API        | Lambda Proxy API로 실시간 호출 |
| ✅ React Web UI 실시간 렌더링| fetchSensorData 함수로 주기적 데이터 갱신 |
| ✅ EC2/S3 제거               | 서버리스로 전환하여 운영비 절감 |

---

## 👨‍💻 개발자

> Made with 💻 by [KimTae-hee]

