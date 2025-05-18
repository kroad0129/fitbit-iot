import React, { createContext, useContext, useState } from 'react';
import { CaregiverMessage } from '@/types/message';

interface MessageContextType {
  messages: CaregiverMessage[];
  addMessage: (message: Omit<CaregiverMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<CaregiverMessage[]>([]);

  const addMessage = (message: Omit<CaregiverMessage, 'id' | 'timestamp'>) => {
    const newMessage: CaregiverMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [newMessage, ...prev]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
} 