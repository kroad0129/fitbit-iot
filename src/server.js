import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 서버 시작 시간 기록
const startTime = new Date();
console.log('서버 시작 시간:', startTime.toLocaleTimeString('ko-KR'));

// 초기 데이터 설정
let monitoringData = {
  temperature: 23.5,
  humidity: 45,
  gasDetection: "안전",
  heartRate: 72,
  stressLevel: 32,
  timestamp: startTime.toISOString(),
};
console.log('초기 데이터 설정:', monitoringData);

function getAbnormalReasons(data) {
  const reasons = [];
  if (data.temperature > 30 || data.temperature < 15) reasons.push('온도');
  if (data.humidity > 65 || data.humidity < 35) reasons.push('습도');
  if (data.gasDetection === '위험') reasons.push('가스');
  if (data.heartRate > 90 || data.heartRate < 50) reasons.push('심박수');
  if (data.stressLevel > 70) reasons.push('스트레스');
  return reasons;
}

// 15초마다 데이터 갱신 (랜덤 시뮬레이션)
let updateCount = 0;
setInterval(() => {
  const now = new Date();
  updateCount++;
  const newData = {
    temperature: +(23 + Math.random() * 10 - 5).toFixed(1),
    humidity: Math.floor(40 + Math.random() * 30 - 10),
    gasDetection: Math.random() < 0.13 ? "위험" : "안전",
    heartRate: Math.floor(70 + Math.random() * 30 - 10),
    stressLevel: Math.floor(30 + Math.random() * 50 - 10),
    timestamp: now.toISOString(),
  };
  const abnormalReasons = getAbnormalReasons(newData);
  monitoringData = {
    ...newData,
    abnormal: abnormalReasons.length > 0,
    abnormalReasons,
  };
  console.log(`[${updateCount}번째 갱신] 서버 데이터 갱신 시간:`, now.toLocaleTimeString('ko-KR'));
  console.log('갱신된 데이터:', monitoringData);
}, 15000);

// 최신 모니터링 데이터 반환
app.get('/api/monitoring', (req, res) => {
  res.json(monitoringData);
});

// 예시: 외부 API를 Axios로 호출하는 엔드포인트
app.get('/api/external', async (req, res) => {
  try {
    // 예시로 JSONPlaceholder의 posts를 가져옴
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: '외부 API 호출 실패', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Express 서버가 정상적으로 동작 중입니다!');
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 