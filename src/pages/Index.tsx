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

  // WebSocket 연결
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'sensor_update') {
        // 새로운 데이터로 상태 업데이트
        setData(prevData => ({
          ...prevData,
          temperature: message.data.temperature,
          humidity: message.data.humidity,
          gasDetection: message.data.gasLevel > 70 ? "위험" : "안전"
        }));
        
        // 알림 표시
        toast({
          title: "센서 데이터 업데이트",
          description: `온도: ${message.data.temperature}°C, 습도: ${message.data.humidity}%, 가스 레벨: ${message.data.gasLevel}`,
          duration: 3000,
        });

        // 모니터링 데이터 추가
        addData(message.data);
        setRefreshCount(prev => prev + 1);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
    };

    return () => {
      ws.close();
    };
  }, [addData]);

  // 히스토리 초기화
  useEffect(() => {
    clearHistory();
  }, []);

  // Check for abnormal values
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
        </header>

        <div className="grid grid-cols-1 gap-8">
          <MonitoringPanel data={data} />
          
          {isAbnormal && (
            <AlertSystem 
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
