import { createContext } from "react";

interface SignalRContextType {
  isConnected: boolean;
  hasAcall: boolean;
  PatientImage:string;
  AppId:string;
  Uid:number;
  ChannelName:string;
  setHasAcall: (value: boolean) => void;
  PatientName:string;
  setHasUnreadNotifications: (value: boolean) => void;
  hasUnreadNotifications: boolean;
}

export const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

