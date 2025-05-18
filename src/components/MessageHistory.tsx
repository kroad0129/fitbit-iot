import React from 'react';
import { useMessages } from '@/contexts/MessageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, AlertTriangle, Bell } from 'lucide-react';

const MessageHistory = () => {
  const { messages } = useMessages();

  const getUrgencyIcon = (urgency: '긴급' | '주의' | '관찰') => {
    switch (urgency) {
      case '긴급':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case '주의':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case '관찰':
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getUrgencyColor = (urgency: '긴급' | '주의' | '관찰') => {
    switch (urgency) {
      case '긴급':
        return 'bg-red-50 border-red-200';
      case '주의':
        return 'bg-yellow-50 border-yellow-200';
      case '관찰':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl text-center">간병인 메시지 내역</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-4">전송된 메시지가 없습니다.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${getUrgencyColor(message.urgency)}`}
              >
                <div className="flex items-start gap-3">
                  {getUrgencyIcon(message.urgency)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        {message.urgency} 알림
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(message.timestamp), 'MM/dd HH:mm', { locale: ko })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{message.message}</p>
                    <div className="flex flex-wrap gap-2">
                      {message.abnormalConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white rounded-full text-sm text-gray-600"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageHistory; 