export interface CaregiverMessage {
  id: string;
  timestamp: string;
  message: string;
  urgency: '긴급' | '주의' | '관찰';
  abnormalConditions: string[];
} 