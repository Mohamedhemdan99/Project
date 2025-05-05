// src/contexts/CallSettingsContext.tsx
import { createContext, useState, useContext } from "react";

type CallSettingsContextType = {
  isMicOn: boolean;
  isVideoOn: boolean;
  toggleMic: () => void;
  toggleVideo: () => void;
};

const CallSettingsContext = createContext<CallSettingsContextType | null>(null);

export const CallSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const toggleMic = () => setIsMicOn(prev => !prev);
  const toggleVideo = () => setIsVideoOn(prev => !prev);

  return (
    <CallSettingsContext.Provider value={{ isMicOn, isVideoOn, toggleMic, toggleVideo }}>
      {children}
    </CallSettingsContext.Provider>
  );
};

export const useCallSettings = () => {
  const context = useContext(CallSettingsContext);
  if (!context) {
    throw new Error('useCallSettings must be used within a CallSettingsProvider');
  }
  return context;
};