const mqtt = require('mqtt');
const { latestSensorData } = require('../shared/state');

const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('✅ MQTT 연결됨');
    mqttClient.subscribe('sensor/data');
});

mqttClient.on('message', (topic, message) => {
    if (topic !== 'sensor/data') return;

    try {
        const parsed = JSON.parse(message.toString());

        latestSensorData.temperature = parsed.temperature;
        latestSensorData.humidity = parsed.humidity;
        latestSensorData.time = new Date().toLocaleTimeString();
        latestSensorData.aircon = parsed.temperature > 27 ? '켜짐' : '꺼짐';
        latestSensorData.fan = parsed.humidity > 60 ? '켜짐' : '꺼짐';

        console.log('📡 센서값:', latestSensorData);
    } catch (e) {
        console.error('❌ 메시지 처리 실패:', e.message);
    }
});
