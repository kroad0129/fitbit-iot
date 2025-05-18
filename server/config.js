module.exports = {
    // 서버 설정
    PORT: process.env.PORT || 4000,
    MQTT_BROKER: process.env.MQTT_BROKER || 'mqtt://localhost:1883',

    // 센서 설정
    DHT_PIN: process.env.DHT_PIN || 4,
    MQ135_PIN: process.env.MQ135_PIN || 18,

    // API 키
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || 'your_weather_api_key_here',

    // 데이터베이스 설정
    MAX_HISTORY: 1000,  // 최대 저장 데이터 개수
}; 