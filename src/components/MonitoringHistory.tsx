import React from 'react';
import { useMonitoring } from '@/contexts/MonitoringContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const MonitoringHistory = () => {
  const { history } = useMonitoring();

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: ko });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl text-center">모니터링 히스토리</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6">
          {/* 온도 차트 */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">온도 변화</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={formatTime}
                      formatter={(value: number) => [`${value}°C`, '온도']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 습도 차트 */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">습도 변화</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 5', 'dataMax + 5']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={formatTime}
                      formatter={(value: number) => [`${value}%`, '습도']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 심박수 차트 */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">심박수 변화</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 5', 'dataMax + 5']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={formatTime}
                      formatter={(value: number) => [`${value} bpm`, '심박수']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 스트레스 레벨 차트 */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">스트레스 레벨 변화</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 5', 'dataMax + 5']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={formatTime}
                      formatter={(value: number) => [`${value}`, '스트레스']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stressLevel" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringHistory; 