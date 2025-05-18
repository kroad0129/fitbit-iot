
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplet, AlarmSmoke, HeartPulse, Activity } from "lucide-react";

interface MonitoringPanelProps {
  data: {
    temperature: number;
    humidity: number;
    gasDetection: string;
    heartRate: number;
    stressLevel: number;
  };
}

const MonitoringPanel = ({ data }: MonitoringPanelProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl text-center">실시간 모니터링</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Temperature Card */}
          <Card className="bg-gradient-to-br from-orange-50 to-white border-2 hover:border-orange-200 transition-all">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-orange-100 p-3 mb-4">
                <Thermometer size={36} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">온도</h3>
              <p className="text-4xl font-bold text-orange-600 mb-2">{data.temperature}°C</p>
              <p className="text-gray-500 text-center">
                {data.temperature > 28 ? "너무 더움" : 
                 data.temperature < 18 ? "너무 추움" : "적정 온도"}
              </p>
            </CardContent>
          </Card>

          {/* Humidity Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-2 hover:border-blue-200 transition-all">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Droplet size={36} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">습도</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">{data.humidity}%</p>
              <p className="text-gray-500 text-center">
                {data.humidity > 60 ? "습함" : 
                 data.humidity < 40 ? "건조함" : "적정 습도"}
              </p>
            </CardContent>
          </Card>

          {/* Gas Detection Card */}
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

          {/* Heart Rate Card */}
          <Card className="bg-gradient-to-br from-red-50 to-white border-2 hover:border-red-200 transition-all md:col-span-1 lg:col-span-2">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <HeartPulse size={36} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">심박수</h3>
              <p className="text-4xl font-bold text-red-600 mb-2">{data.heartRate} bpm</p>
              <p className="text-gray-500 text-center">
                {data.heartRate > 85 ? "빠른 심박" : 
                 data.heartRate < 55 ? "느린 심박" : "정상 심박"}
              </p>
            </CardContent>
          </Card>

          {/* Stress Level Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border-2 hover:border-purple-200 transition-all md:col-span-1">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="rounded-full bg-purple-100 p-3 mb-4">
                <Activity size={36} className="text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-1">스트레스 반응</h3>
              <p className="text-4xl font-bold text-purple-600 mb-2">{data.stressLevel}</p>
              <p className="text-gray-500 text-center">
                {data.stressLevel > 60 ? "높음" : 
                 data.stressLevel < 30 ? "낮음" : "보통"}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringPanel;
