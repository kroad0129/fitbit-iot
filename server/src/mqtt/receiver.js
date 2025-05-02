const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const { uploadLogFile } = require('../utils/s3Uploader');
const { latestSensorData } = require('../shared/state');

// MQTT 브로커에 연결 (노트북에서 mosquitto 실행 중이면 localhost 사용)
const mqttClient = mqtt.connect('mqtt://localhost:1883');

// MQTT 연결 성공 시 실행
mqttClient.on('connect', () => {
    console.log('✅ MQTT 연결됨');

    // sensor/data 토픽 구독
    mqttClient.subscribe('sensor/data', (err) => {
        if (err) {
            console.error('❌ sensor/data 토픽 구독 실패:', err);
        } else {
            console.log('📡 sensor/data 토픽 구독 성공');
        }
    });
});

// 메시지 수신 시 처리
mqttClient.on('message', (topic, message) => {
    console.log('📥 message 이벤트 발생!');
    console.log('📥 수신된 토픽:', topic);
    console.log('📥 수신된 메시지:', message.toString());

    if (topic === 'sensor/data') {
        try {
            const parsed = JSON.parse(message.toString());
            const temp = parsed.temperature;
            const humi = parsed.humidity;

            // 최신 센서 데이터 업데이트
            latestSensorData.temperature = temp;
            latestSensorData.humidity = humi;
            latestSensorData.time = new Date().toLocaleTimeString();
            latestSensorData.aircon = temp > 27 ? '켜짐' : '꺼짐';
            latestSensorData.fan = humi > 60 ? '켜짐' : '꺼짐';

            console.log('📡 센서값 업데이트:', latestSensorData);

            // 로그 파일 저장
            const dateString = new Date().toISOString().slice(0, 10);
            const logFilename = `log_${dateString}.json`;
            const logPath = path.join(__dirname, '../logs', logFilename);

            let logs = [];
            if (fs.existsSync(logPath)) {
                logs = JSON.parse(fs.readFileSync(logPath));
            }

            logs.push({
                ...latestSensorData,
                timestamp: new Date().toISOString(),
            });

            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

            // S3에 업로드
            const s3Key = `logs/${dateString}/${logFilename}`;
            uploadLogFile(logPath, s3Key);

        } catch (e) {
            console.error('❌ JSON 파싱 실패:', e);
        }
    }
});
