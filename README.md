# 안녕케어허브 (Annyeong Care Hub)

## 프로젝트 소개
안녕케어허브는 라즈베리파이를 활용한 실시간 환경 모니터링 시스템입니다.

## 주요 기능
- 실시간 온도/습도 모니터링
- 가스 감지 및 알림
- 웹 기반 대시보드

## 기술 스택
- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- IoT: Raspberry Pi, MQTT
- 센서: DHT22(온습도), MQ-135(가스)

## 설치 및 실행 방법

### 서버 실행
```bash
cd server
npm install
node server.js
```

### 프론트엔드 실행
```bash
npm install
npm run dev
```

### 라즈베리파이 설정
```bash
# 필요한 라이브러리 설치
sudo apt-get update
sudo apt-get install python3-pip
pip3 install paho-mqtt RPi.GPIO Adafruit_DHT adafruit-circuitpython-mq135

# 센서 데이터 수집 및 전송
python3 raspberry_pi_client.py
```
