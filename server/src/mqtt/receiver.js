const mqtt = require('mqtt');
const { uploadLogFile } = require('../utils/s3Uploader');
const { latestSensorData } = require('../shared/state');

// MQTT 브로커에 연결
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('✅ MQTT 연결됨');

    mqttClient.subscribe('sensor/data', (err) => {
        if (err) {
            console.error('❌ sensor/data 토픽 구독 실패:', err);
        } else {
            console.log('📡 sensor/data 토픽 구독 성공');
        }
    });
});

mqttClient.on('message', (topic, message) => {
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

        console.log(
            `[${latestSensorData.time}] 🌡 ${temp}℃  💧 ${humi}%  🌀 ${latestSensorData.aircon}  🌪 ${latestSensorData.fan}`
        );

        const date = new Date();
        const dateString = date.toISOString().slice(0, 10);
        const timestamp = date.toISOString();
        const s3Key = `logs/${dateString}/log_${timestamp}.json`;

        const logData = {
            ...latestSensorData,
            timestamp
        };

        uploadLogFile(logData, s3Key)
            .then(() => {
                console.log(`☁️ S3 업로드 완료: ${s3Key}`);
            })
            .catch(err => {
                console.error('❌ S3 업로드 실패:', err);
            });

    } catch (e) {
        console.error('❌ JSON 파싱 실패:', e);
    }
});
