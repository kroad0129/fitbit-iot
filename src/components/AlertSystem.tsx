import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Bell, BellRing, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useMessages } from "@/contexts/MessageContext";
import { useMonitoring } from "@/contexts/MonitoringContext";

interface AlertSystemProps {
  abnormalData: {
    temperature: number;
    humidity: number;
    gasDetection: string;
    heartRate: number;
    stressLevel: number;
    timestamp?: string;
    abnormal?: boolean;
    abnormalReasons?: string[];
  };
}

const AlertSystem = ({ abnormalData }: AlertSystemProps) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [alertSent, setAlertSent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis: string;
    message: string;
    urgency: '긴급' | '주의' | '관찰';
  } | null>(null);
  const { addMessage } = useMessages();
  const { history } = useMonitoring();

  const abnormalReasons = abnormalData.abnormalReasons || [];

  // 심각한 이상 반응인지 확인
  const isSeriousAbnormal = () => {
    return abnormalData.gasDetection === "위험" || // 가스 감지는 항상 심각
           abnormalData.heartRate > 90 || abnormalData.heartRate < 50 || // 심박수 이상은 심각
           abnormalData.stressLevel > 70; // 높은 스트레스는 심각
  };

  // Countdown timer effect
  useEffect(() => {
    if (secondsLeft > 0 && !alertSent && dialogOpen) {
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timerId);
    } else if (secondsLeft === 0 && !alertSent && dialogOpen) {
      sendAlert();
    }
  }, [secondsLeft, alertSent, dialogOpen]);

  const sendAlert = async () => {
    try {
      // 서버 API 호출
      const response = await fetch('http://localhost:4000/api/analyze-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: history.data })
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      const result = await response.json();
      const analysis = {
        analysis: result.analysis,
        message: result.recommendations[0],
        urgency: result.urgency
      };
      setAiAnalysis(analysis);

      // 메시지 저장
      addMessage({
        message: analysis.message,
        urgency: analysis.urgency,
        abnormalConditions: abnormalReasons
      });

      setAlertSent(true);
      toast({
        title: "간병인에게 알림이 전송되었습니다",
        description: analysis.message,
        duration: 5000,
      });
    } catch (error) {
      console.error('알림 분석 실패:', error);
      toast({
        title: "알림 전송 실패",
        description: "알림 분석 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const cancelAlert = () => {
    setDialogOpen(false);
    toast({
      title: "알림이 취소되었습니다",
      description: "정상으로 판단하셨습니다.",
      duration: 3000,
    });
  };

  const getUrgencyColor = (urgency: '긴급' | '주의' | '관찰') => {
    switch (urgency) {
      case '긴급':
        return 'text-red-600';
      case '주의':
        return 'text-yellow-600';
      case '관찰':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      {isSeriousAbnormal() && (
        <>
          {/* Alert banner */}
          <Alert variant="destructive" className="border-4 border-destructive">
            <Zap className="h-8 w-8" />
            <AlertTitle className="text-2xl font-bold mb-2">이상 감지됨!</AlertTitle>
            <AlertDescription className="text-lg">
              <p className="mb-2">다음과 같은 이상 징후가 감지되었습니다:</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                {abnormalReasons.length > 0
                  ? abnormalReasons.map((reason, index) => (
                      <li key={index}>{reason} 이상</li>
                    ))
                  : <li>이상 항목 없음</li>}
              </ul>
              {aiAnalysis && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-2">AI 분석 결과:</p>
                  <p className="mb-2">{aiAnalysis.analysis}</p>
                  <p className={`font-bold ${getUrgencyColor(aiAnalysis.urgency)}`}>
                    긴급도: {aiAnalysis.urgency}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Alert countdown dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-red-600">
                  <BellRing className="inline-block mr-2 h-6 w-6" />
                  이상 징후 감지
                </DialogTitle>
                <DialogDescription className="text-lg">
                  {secondsLeft}초 후에 자동으로 간병인에게 알림이 전송됩니다.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-4 mt-4">
                <Button
                  variant="outline"
                  onClick={cancelAlert}
                  className="flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
                <Button
                  onClick={sendAlert}
                  className="flex items-center bg-red-600 hover:bg-red-700"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  지금 알림 보내기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default AlertSystem;
