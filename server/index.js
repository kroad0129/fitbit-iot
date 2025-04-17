const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// MQTT 수신 처리 연결 (이 파일을 불러오기만 하면 동작함)
require('./src/mqtt/receiver');

// 라우터 등록
const sensorRouter = require('./src/routes/sensor');
app.use('/api', sensorRouter);

// 정적 웹 제공
app.use(express.static(path.join(__dirname, 'src', 'views')));

// 서버 실행
app.listen(port, () => {
    console.log(`서버 실행 중: http://localhost:${port}`);
});
