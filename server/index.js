const express = require('express');
const mqtt = require('mqtt');
const path = require('path');

const app = express();
const port = 3000;

// 최신 센서값 저장용 변수
let latestSensorData = {
    temperature: null,
    humidity: null,
    time: null,
    aircon: "대기 중",
    fan: "대기 중"
};

// MQTT 브로커 연결
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('MQTT 연결됨');
    mqttClient.subscribe('sensor/data');
});

mqttClient.on('message', (topic, message) => {
    if (topic === 'sensor/data') {
        try {
            const parsed = JSON.parse(message.toString());
            const temp = parsed.temperature;
            const humi = parsed.humidity;

            latestSensorData.temperature = temp;
            latestSensorData.humidity = humi;
            latestSensorData.time = new Date().toLocaleTimeString();

            latestSensorData.aircon = temp > 27 ? "켜짐" : "꺼짐";
            latestSensorData.fan = humi > 60 ? "켜짐" : "꺼짐";

            console.log("📡 센서값:", latestSensorData);
        } catch (e) {
            console.error("파싱 실패:", e);
        }
    }
});


// 정적 HTML 서빙
app.use(express.static(path.join(__dirname, 'public')));

// 센서값 API
app.get('/api/sensor', (req, res) => {
    res.json(latestSensorData);
});

app.listen(port, () => {
    console.log(`서버 실행 중: http://localhost:${port}`);
});

