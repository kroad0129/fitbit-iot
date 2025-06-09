import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [alertSent, setAlertSent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addMessage } = useMessages();
  const { history } = useMonitoring();

  const abnormalReasons = abnormalData.abnormalReasons || [];

  const prevAbnormalRef = useRef(false);

  const isSeriousAbnormal = () => {
    return (
      abnormalData.gasDetection === "위험" ||
      abnormalData.heartRate > 120 ||
      abnormalData.heartRate < 50 ||
      abnormalData.stressLevel > 70 ||
      abnormalData.temperature > 30 ||
      abnormalData.humidity > 70
    );
  };

  useEffect(() => {
    const isNowAbnormal = isSeriousAbnormal();

    // 새로 비정상 상태 진입 시에만 다이얼로그 트리거
    if (isNowAbnormal && !prevAbnormalRef.current) {
      setDialogOpen(true);
      setSecondsLeft(10);
      setAlertSent(false);
    }

    prevAbnormalRef.current = isNowAbnormal;
  }, [abnormalData]);

  useEffect(() => {
    if (secondsLeft > 0 && !alertSent && dialogOpen) {
      const timerId = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (secondsLeft === 0 && !alertSent && dialogOpen) {
      sendAlert();
    }
  }, [secondsLeft, alertSent, dialogOpen]);

  const sendAlert = async () => {
    try {
      const response = await fetch(
        "https://uug2wtk3g0.execute-api.ap-northeast-2.amazonaws.com/monitoring/alert",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: "건강 이상 감지",
            reason: abnormalReasons.join(", ") || "이상 감지"
          })
        }
      );

      if (!response.ok) throw new Error("Lambda 응답 오류");

      setAlertSent(true);
      addMessage({
        message: "임계값 초과로 간병인에게 이메일이 전송되었습니다.",
        urgency: "긴급",
        abnormalConditions: abnormalReasons,
      });

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

  const cancelAlert = () => {
    setDialogOpen(false);
    toast({
      title: "알림이 취소되었습니다",
      description: "사용자가 정상으로 판단했습니다.",
      duration: 3000,
    });
  };

  return (
    <>
      {isSeriousAbnormal() && (
        <>
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
            </AlertDescription>
          </Alert>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-red-600">
                  <BellRing className="inline-block mr-2 h-6 w-6" />
                  이상 징후 감지
                </DialogTitle>
                <DialogDescription className="text-lg">
                  {secondsLeft}초 후에 간병인에게 이메일이 전송됩니다.
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
                  지금 전송
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
