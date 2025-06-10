import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, BellRing, X, Thermometer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { fetchSensorData } from "@/api/sensor";

const MonitoringPanel = () => {
  const [data, setData] = useState({
    temperature: 0,
    humidity: 0,
    gasDetection: "안전",
    heartRate: 0,
    stressLevel: 0,
  });

  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [alertSent, setAlertSent] = useState(false);
  const [alertReason, setAlertReason] = useState("");
  const [hasAlerted, setHasAlerted] = useState(false);

  // 센서 데이터 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const sensor = await fetchSensorData();
        setData(sensor);
      } catch (error) {
        console.error("센서 데이터 로드 실패:", error);
        toast({
          title: "센서 데이터 로드 실패",
          description: "데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  // 이상 징후 감지 및 알림 처리
  useEffect(() => {
    if (hasAlerted) return; // 이미 알림이 발생했다면 추가 알림 방지

    let reason = "";
    if (data.temperature >= 30) {
      reason = `온도가 ${data.temperature}°C로 너무 높습니다.`;
    }
    if (data.humidity > 70) {
      reason = reason ? `${reason} 습도가 ${data.humidity}%로 너무 높습니다.` : `습도가 ${data.humidity}%로 너무 높습니다.`;
    }
    if (data.gasDetection === "위험") {
      reason = reason ? `${reason} 가스가 감지되었습니다.` : "가스가 감지되었습니다.";
    }

    if (reason) {
      setAlertReason(reason);
      setAlertDialogOpen(true);
      setSecondsLeft(10);
      setAlertSent(false);
      setHasAlerted(true); // 알림 발생 상태 저장
    }
  }, [data, hasAlerted]);

  // 10초 타이머 처리
  useEffect(() => {
    if (!alertDialogOpen || alertSent) return; // alertSent면 타이머 멈춤

    if (secondsLeft === 0 && !alertSent) {
      sendAlert();
      return; // 타이머 멈춤
    }

    const timer = setTimeout(() => {
      if (secondsLeft > 0 && alertDialogOpen && !alertSent) {
        setSecondsLeft(secondsLeft - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, alertDialogOpen, alertSent]);

  // 알림 전송 함수
  const sendAlert = async () => {
    try {
      const response = await fetch("https://uug2wtk3g0.execute-api.ap-northeast-2.amazonaws.com/monitoring/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject: "건강 이상 감지",
          reason: alertReason,
          sensorData: {
            temperature: data.temperature,
            humidity: data.humidity,
            gasDetection: data.gasDetection,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("알림 전송 실패: " + errorText);
      }

      const result = await response.json();
      setAlertSent(true);
      toast({
        title: "📨 이메일 전송됨",
        description: "간병인에게 알림이 전송되었습니다.",
        duration: 5000,
      });
    } catch (error) {
      console.error("알림 전송 실패:", error);
      toast({
        title: "❌ 이메일 전송 실패",
        description: "서버 요청 중 문제가 발생했습니다.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // 알림 취소 함수
  const cancelAlert = () => {
    setAlertDialogOpen(false);
    setAlertSent(false);
    toast({
      title: "알림 취소됨",
      description: "사용자가 정상으로 판단했습니다.",
      duration: 3000,
    });
  };

  // 알림 다이얼로그 닫기 함수
  const closeAlertDialog = () => {
    setAlertDialogOpen(false);
    setAlertSent(false);
    setSecondsLeft(10);
    setHasAlerted(false);
  };

  return (
    <div>
      {/* 센서 데이터 표시 */}
      <Card>
        <CardHeader>
          <CardTitle>실시간 모니터링</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Thermometer className={data.temperature >= 30 ? "text-red-500" : "text-orange-500"} />
              <p>온도: {data.temperature}°C</p>
            </div>
            <div className="flex items-center space-x-2">
              <Droplet className={data.humidity > 70 ? "text-red-500" : "text-blue-500"} />
              <p>습도: {data.humidity}%</p>
            </div>
            <div className="flex items-center space-x-2">
              <BellRing className={data.gasDetection === "안전" ? "text-green-500" : "text-red-500"} />
              <p>가스 상태: {data.gasDetection}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 다이얼로그 */}
      {alertDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BellRing className="text-red-500 h-6 w-6" />
                <h3 className="text-xl font-bold">이상 징후 감지됨!</h3>
              </div>
              <button onClick={closeAlertDialog} className="text-gray-500 hover:text-gray-700" style={{ display: alertSent ? "block" : "none" }}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-700 mb-4">{alertReason}</p>
            {alertSent ? (
              <p className="text-lg font-semibold mb-4 text-green-600">이메일이 전송되었습니다.</p>
            ) : (
              <p className="text-lg font-semibold mb-4">{secondsLeft}초 후 이메일 전송됩니다.</p>
            )}

            <div className="flex justify-end">
              {!alertSent ? (
                <button
                  onClick={cancelAlert}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
              ) : (
                <button
                  onClick={closeAlertDialog}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringPanel;
