import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MonitoringData, MonitoringHistory } from '@/types/monitoring';

interface MonitoringContextType {
  currentData: MonitoringData | null;
  history: MonitoringHistory;
  addData: (data: Omit<MonitoringData, 'timestamp'>) => void;
  clearHistory: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    currentData: MonitoringData | null;
    history: MonitoringHistory;
  }>({
    currentData: null,
    history: {
    data: [],
    lastUpdated: new Date().toISOString(),
    },
  });

  // 로컬 스토리지에서 히스토리 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem('monitoringHistory');
    if (savedHistory) {
      setState(prev => ({
        ...prev,
        history: JSON.parse(savedHistory),
      }));
    }
  }, []);

  // 히스토리 저장 (디바운스 처리)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('monitoringHistory', JSON.stringify(state.history));
    }, 1000); // 1초 후에 저장

    return () => clearTimeout(timeoutId);
  }, [state.history]);

  const addData = useCallback((data: Omit<MonitoringData, 'timestamp'>) => {
    const newData: MonitoringData = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      currentData: newData,
      history: {
        data: [...prev.history.data, newData].slice(-1000), // 최근 1000개 데이터만 유지
      lastUpdated: new Date().toISOString(),
      },
    }));
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem('monitoringHistory');
    setState(prev => ({
      ...prev,
      history: {
      data: [],
      lastUpdated: new Date().toISOString(),
      },
    }));
  }, []);

  return (
    <MonitoringContext.Provider 
      value={{ 
        currentData: state.currentData, 
        history: state.history, 
        addData, 
        clearHistory 
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
} 