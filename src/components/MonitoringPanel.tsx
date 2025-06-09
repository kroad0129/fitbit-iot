import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplet, AlarmSmoke, HeartPulse, Activity } from "lucide-react";
import { fetchSensorData } from "@/api/sensor";

const MonitoringPanel = () => {
  const [data, setData] = useState({
    temperature: 0,
    humidity: 0,
    gasDetection: "안전",
    heartRate: 0,
    stressLevel: 0
  });

  const [alarmTimes, setAlarmTimes] = useState<string[]>(["08:00"]);
  const [triggeredToday, setTriggeredToday] = useState<{ [key: string]: boolean }>({});

  const prevDataRef = useRef(data);

  useEffect(() => {
    const load = async () => {
      const sensor = await fetchSensorData();
      setData(sensor);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔁 알람 감지 및 TTS
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      alarmTimes.forEach((time) => {
        if (hhmm === time && !triggeredToday[time]) {
          const message = `현재 시간은 ${time}입니다. 온도는 ${data.temperature}도, 습도는 ${data.humidity}퍼센트, 심박수는 ${data.heartRate}입니다.`;
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = "ko-KR";
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
          setTriggeredToday((prev) => ({ ...prev, [time]: true }));
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alarmTimes, triggeredToday, data]);

  // 🌙 자정마다 알람 리셋
  useEffect(() => {
    const midnightReset = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setTriggeredToday({});
      }
    }, 60 * 1000);
    return () => clearInterval(midnightReset);
  }, []);

  const addAlarm = (newTime: string) => {
    if (!alarmTimes.includes(newTime)) {
      setAlarmTimes([...alarmTimes, newTime].sort());
    }
  };

  const removeAlarm = (time: string) => {
    setAlarmTimes(alarmTimes.filter((t) => t !== time));
    setTriggeredToday((prev) => {
      const copy = { ...prev };
      delete copy[time];
      return copy;
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl text-center">실시간 모니터링</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* 🕒 알람 설정 */}
        <div className="mb-6">
          <label className="font-semibold">알람 시간 추가</label>
          <div className="flex gap-2 mt-2 items-center">
            <input
              type="time"
              onChange={(e) => addAlarm(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="mt-4">
            {alarmTimes.map((time) => (
              <div key={time} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{time}</span>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => removeAlarm(time)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 센서 카드 UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 온도 */}
          <Card className="bg-gradient-to-br from-orange-50 to-white border-2 hover:border-orange-200 transition-all">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-orange-100 p-3 mb-4">
                <Thermometer size={36} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">온도</h3>
              <p className="text-4xl font-bold text-orange-600 mb-2">{data.temperature}°C</p>
              <p className="text-gray-500 text-center">
                {data.temperature > 28 ? "너무 더움" : data.temperature < 18 ? "너무 추움" : "적정 온도"}
              </p>
            </CardContent>
          </Card>

          {/* 습도 */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-2 hover:border-blue-200 transition-all">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Droplet size={36} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">습도</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">{data.humidity}%</p>
              <p className="text-gray-500 text-center">
                {data.humidity > 60 ? "습함" : data.humidity < 40 ? "건조함" : "적정 습도"}
              </p>
            </CardContent>
          </Card>

          {/* 가스 감지 */}
          <Card className="bg-gradient-to-br from-gray-50 to-white border-2 hover:border-gray-200 transition-all">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <AlarmSmoke size={36} className={data.gasDetection === "안전" ? "text-green-500" : "text-red-500"} />
              </div>
              <h3 className="text-2xl font-bold mb-1">가스 감지</h3>
              <p className={`text-4xl font-bold mb-2 ${data.gasDetection === "안전" ? "text-green-600" : "text-red-600"}`}>
                {data.gasDetection}
              </p>
              <p className="text-gray-500 text-center">
                {data.gasDetection === "안전" ? "정상 상태" : "위험 상태!"}
              </p>
            </CardContent>
          </Card>

          {/* 심박수 */}
          <Card className="bg-gradient-to-br from-red-50 to-white border-2 hover:border-red-200 transition-all md:col-span-1 lg:col-span-2">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <HeartPulse size={36} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">심박수</h3>
              <p className="text-4xl font-bold text-red-600 mb-2">{data.heartRate} bpm</p>
              <p className="text-gray-500 text-center">
                {data.heartRate > 85 ? "빠른 심박" : data.heartRate < 55 ? "느린 심박" : "정상 심박"}
              </p>
            </CardContent>
          </Card>

          {/* 스트레스 반응 */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border-2 hover:border-purple-200 transition-all md:col-span-1">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-purple-100 p-3 mb-4">
                <Activity size={36} className="text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">스트레스 반응</h3>
              <p className="text-4xl font-bold text-purple-600 mb-2">{data.stressLevel}</p>
              <p className="text-gray-500 text-center">
                {data.stressLevel > 60 ? "높음" : data.stressLevel < 30 ? "낮음" : "보통"}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringPanel;
