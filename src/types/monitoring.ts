export interface MonitoringData {
  temperature: number;
  humidity: number;
  gasDetection: string;
  heartRate: number;
  stressLevel: number;
  timestamp: string;
}

export interface MonitoringHistory {
  data: MonitoringData[];
  lastUpdated: string;
} 