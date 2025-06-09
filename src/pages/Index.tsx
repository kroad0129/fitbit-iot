import React, { useEffect, useState } from "react";
import MonitoringPanel from "@/components/MonitoringPanel";
import AlertSystem from "@/components/AlertSystem";
import MonitoringHistory from "@/components/MonitoringHistory";
import MessageHistory from "@/components/MessageHistory";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { MonitoringProvider, useMonitoring } from "@/contexts/MonitoringContext";
import { MessageProvider } from "@/contexts/MessageContext";
import axios from "axios";

const handleFitbitLogin = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/fitbit/auth-url");
    const authUrl = response.data.url;
    window.location.href = authUrl;
  } catch (error) {
    console.error("Fitbit 인증 URL 요청 실패:", error);
    toast({
      title: "인증 오류",
      description: "Fitbit 로그인 URL을 불러올 수 없습니다.",
      variant: "destructive",
    });
  }
};

const MonitoringContent = () => {
  const { addData, clearHistory } = useMonitoring();
  const [refreshCount, setRefreshCount] = useState(0);
  const [data, setData] = useState({
    temperature: 23.5,
    humidity: 45,
    gasDetection: "안전",
    heartRate: 72,
    stressLevel: 32,
  });
  const [fitbitUser, setFitbitUser] = useState(null);

  useEffect(() => {
    const checkFitbitLogin = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/fitbit/data");
        if (response.data.profile?.user?.displayName) {
          setFitbitUser(response.data.profile.user.displayName);
        }

        const fitbitData = response.data;
        setData(prevData => ({
          ...prevData,
          heartRate: fitbitData.heartRate?.["activities-heart"]?.[0]?.value?.restingHeartRate || prevData.heartRate,
        }));
      } catch (error) {
        console.log("Fitbit 로그인 필요 또는 데이터 오류:", error);
        setFitbitUser(null);
      }
    };

    checkFitbitLogin();
  }, []);

  // 주기적 센서 데이터 가져오기 (IoT + API Gateway)
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch("https://uug2wtk3g0.execute-api.ap-northeast-2.amazonaws.com/monitoring/sensor");
        const rawData = await res.json();
        if (!Array.isArray(rawData) || rawData.length === 0) return;

        const latest = rawData[0];
        const updated = {
          temperature: Number(latest.temperature),
          humidity: Number(latest.humidity),
          gasDetection: latest.gas_detected === 1 ? "위험" : "안전",
          heartRate: data.heartRate,
          stressLevel: data.stressLevel
        };

        setData(updated);
        addData(updated);
        setRefreshCount(prev => prev + 1);

        toast({
          title: "센서 데이터 업데이트",
          description: `온도: ${updated.temperature}°C, 습도: ${updated.humidity}%, 가스: ${updated.gasDetection}`,
          duration: 3000,
        });
      } catch (err) {
        console.error("센서 데이터 가져오기 실패:", err);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    clearHistory();
  }, []);

  const checkForAbnormalValues = (data) => {
    const reasons = [];
    if (data.temperature > 30 || data.temperature < 15) reasons.push('온도');
    if (data.humidity > 65 || data.humidity < 35) reasons.push('습도');
    if (data.gasDetection === "위험") reasons.push('가스');
    if (data.heartRate > 90 || data.heartRate < 50) reasons.push('심박수');
    if (data.stressLevel > 70) reasons.push('스트레스');

    return {
      isAbnormal: reasons.length > 0,
      reasons
    };
  };

  const { isAbnormal, reasons } = checkForAbnormalValues(data);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">건강 모니터링 대시보드</h1>
          <p className="text-xl text-gray-600">
            마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {refreshCount}회 갱신됨
            </span>
          </p>
          {fitbitUser ? (
            <div className="mt-4 text-green-600 font-medium">
              {fitbitUser}님, Fitbit으로 로그인됨
            </div>
          ) : (
            <button
              onClick={handleFitbitLogin}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Fitbit 로그인
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8">
          <MonitoringPanel data={data} />
          {isAbnormal && (
            <AlertSystem
              key={reasons.join("-")}
              abnormalData={{
                ...data,
                abnormal: true,
                abnormalReasons: reasons
              }}
            />
          )}
          <MessageHistory />
          <MonitoringHistory />
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <MonitoringProvider>
      <MessageProvider>
        <MonitoringContent />
        <Toaster />
      </MessageProvider>
    </MonitoringProvider>
  );
};

export default Index;
