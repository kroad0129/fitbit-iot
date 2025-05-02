const mqtt = require('mqtt');
const { appendLogToS3 } = require('../utils/s3Uploader');
const { latestSensorData } = require('../shared/state');

const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('✅ MQTT 연결됨');
    mqttClient.subscribe('sensor/data', (err) => {
        if (err) console.error('❌ 토픽 구독 실패:', err);
        else console.log('📡 sensor/data 토픽 구독 성공');
    });
});

mqttClient.on('message', async (topic, message) => {
    if (topic !== 'sensor/data') return;

    try {
        const parsed = JSON.parse(message.toString());
        const temp = parsed.temperature;
        const humi = parsed.humidity;

        latestSensorData.temperature = temp;
        latestSensorData.humidity = humi;
        latestSensorData.time = new Date().toLocaleTimeString();
        latestSensorData.aircon = temp > 27 ? '켜짐' : '꺼짐';
        latestSensorData.fan = humi > 60 ? '켜짐' : '꺼짐';

        const logData = {
            ...latestSensorData,
            timestamp: new Date().toISOString(),
        };

        const dateString = new Date().toISOString().slice(0, 10);
        const s3Key = await appendLogToS3(logData, dateString);

        console.log(`[${latestSensorData.time}] 🌡 ${temp}℃ 💧 ${humi}% 🌀 ${latestSensorData.aircon} 🌪 ${latestSensorData.fan}`);
        console.log(`☁️ S3 누적 로그 저장됨: ${s3Key}`);
    } catch (e) {
        console.error('❌ JSON 파싱 실패:', e);
    }
});
