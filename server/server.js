const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 4000;

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 메모리에 데이터 저장
let sensorDataHistory = [];
const MAX_HISTORY = 1000; // 최대 저장 개수

// WebSocket 연결 관리
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('클라이언트 연결됨');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('클라이언트 연결 해제');
  });
});

// 모든 클라이언트에게 메시지 브로드캐스트
function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// MQTT 클라이언트 설정
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883');
const MQTT_TOPIC = 'sensor/data';

mqttClient.on('connect', () => {
  console.log('MQTT 브로커 연결 성공');
  mqttClient.subscribe(MQTT_TOPIC);
});

mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('수신된 센서 데이터:', data);

    // 데이터에 타임스탬프 추가
    const sensorData = {
      ...data,
      timestamp: new Date()
    };

    // 메모리에 데이터 저장
    sensorDataHistory.unshift(sensorData);
    if (sensorDataHistory.length > MAX_HISTORY) {
      sensorDataHistory.pop(); // 가장 오래된 데이터 제거
    }

    console.log('센서 데이터 저장 완료');

    // WebSocket을 통해 모든 클라이언트에게 알림 전송
    broadcast({
      type: 'sensor_update',
      data: sensorData,
      message: '새로운 센서 데이터가 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('데이터 처리 중 오류:', error);
  }
});

// REST API 엔드포인트
// 최근 센서 데이터 조회
app.get('/api/sensors/latest', (req, res) => {
  try {
    const latestData = sensorDataHistory[0] || null;
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ error: '데이터 조회 실패' });
  }
});

// 특정 기간의 센서 데이터 조회
app.get('/api/sensors/history', (req, res) => {
  try {
    const { start, end } = req.query;
    let filteredHistory = sensorDataHistory;
    
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      filteredHistory = sensorDataHistory.filter(data => {
        const timestamp = new Date(data.timestamp);
        return timestamp >= startDate && timestamp <= endDate;
      });
    }

    res.json(filteredHistory);
  } catch (error) {
    res.status(500).json({ error: '데이터 조회 실패' });
  }
});

// 이상 징후 분석 및 알림 메시지 생성
app.post('/api/analyze-alert', async (req, res) => {
  try {
    const { history } = req.body;
    
    // 최근 1분(4개의 데이터 포인트)의 데이터만 사용
    const recentData = history.slice(-4);
    
    const prompt = `너는 과거 1분의 히스토리를 기반으로 노인 건강 상태를 분석하여 간병인에게 보낼 메시지를 작성해주는 도우미야.
다음 형식으로 응답해주세요:
{
  "analysis": "노인의 현재 상태에 대한 분석",
  "message": "간병인에게 전달할 메시지",
  "urgency": "긴급/주의/관찰" 중 하나
}

최근 1분간의 건강 모니터링 데이터입니다. 분석해주세요:
${recentData.map(d => `
시간: ${new Date(d.timestamp).toLocaleString('ko-KR')}
- 온도: ${d.temperature}°C
- 습도: ${d.humidity}%
- 가스 감지: ${d.gasDetection}
- 심박수: ${d.heartRate} bpm
- 스트레스 레벨: ${d.stressLevel}
`).join('\n')}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "너는 노인 건강 상태를 분석하는 전문가야." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysisContent = completion.choices[0].message.content;
    const analysis = JSON.parse(analysisContent);

    res.json({
      timestamp: new Date().toISOString(),
      analysis: analysis.analysis,
      recommendations: [analysis.message],
      urgency: analysis.urgency
    });
  } catch (error) {
    console.error('알림 분석 중 오류:', error);
    res.status(500).json({ error: '알림 분석 실패' });
  }
});

// 서버 시작
server.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 