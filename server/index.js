const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// ✅ MQTT 수신 코드 (에러 감싸기)
try {
    require('./src/mqtt/receiver');
} catch (e) {
    console.error('❌ receiver.js 로드 실패:', e);
}

// ✅ API 라우터
const sensorRouter = require('./src/routes/sensor');
app.use('/api', sensorRouter);

// ✅ 정적 파일 제공 (루트에 연결)
app.use('/', express.static(path.join(__dirname, 'src', 'views')));

// ✅ 루트 경로에서 index.html 직접 반환
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'src', 'views', 'index.html'));
});

// ✅ 서버 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ 서버 실행 중: http://15.165.203.122:${port}`);
});
