const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// ✅ MQTT 수신 코드 (에러 감싸기)
try {
    require('./src/mqtt/receiver');
} catch (e) {
    console.error('❌ receiver.js 로드 실패:', e);
}

// ✅ API 라우터
const sensorRouter = require('./src/routes/sensor');
app.use('/api', sensorRouter);

// ✅ 정적 파일 제공 (index.html 포함)
app.use('/', express.static(path.join(__dirname, 'src', 'views')));

// ✅ 서버 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ 서버 실행 중: http://15.165.203.122:${port}`);
});
