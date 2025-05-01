const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const { uploadLogFile } = require('../utils/s3Uploader');
const { latestSensorData } = require('../shared/state');

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
            console.log("📥 수신된 메시지:", message.toString());

            const dateString = new Date().toISOString().slice(0, 10);
            const logFilename = `log_${dateString}.json`;
            const logPath = path.join(__dirname, '../logs', logFilename);

            let logs = [];
            if (fs.existsSync(logPath)) {
                logs = JSON.parse(fs.readFileSync(logPath));
            }

            logs.push({
                ...latestSensorData,
                timestamp: new Date().toISOString()
            });

            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

            const s3Key = `logs/${dateString}/${logFilename}`;
            uploadLogFile(logPath, s3Key);

        } catch (e) {
            console.error("파싱 실패:", e);
        }
    }
});
