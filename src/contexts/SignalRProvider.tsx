import React, { createContext, useContext, useEffect, useState } from 'react';
import { signalRService } from '../services/signalRService.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SignalRContext } from './SiganlRContext.ts';
import { useAuth } from '@/hooks/useAuth.ts';
import ReceiveCall from '@/pages/ReceiveCall.tsx';


export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [ hasAcall, setHasAcall] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const navigate = useNavigate();
  const {isAuthenticated}= useAuth();
  const [PatientName, setName] = useState('');
const[ChannelName, setChannelName] = useState('');
const[AppId, setAppId] = useState('');
const[Uid, setUid] = useState(0);
const[PatientImage, setPatientImage] = useState('');


  useEffect(() => {
    let mounted = true;

    const initializeSignalR = async () => {
      if (!isAuthenticated) {
        console.log("SignalRProvider: Not authenticated, skipping initialization");
        return;
      }

      try {
        console.log("SignalRProvider: Starting SignalR initialization");
        await signalRService.startConnection();
        
        if (!mounted) return;
        setIsConnected(true);
        
        await signalRService.joinOnlineHelpersGroup();

        if (!mounted) return;
        // Subscribe to new post notifications
        await signalRService.subscribeToNewPostCreated((data) => {
          if (!mounted) return;
          console.log('SignalRProvider: New post notification received:', data);
          setHasUnreadNotifications(true);

          // Show toast notification
          toast.info('New post available!', {
            position: 'top-center',
            style: { top: '20px', left: '50%', transform: 'translateX(-50%)' },
            icon: '📢',
            duration: 5000,
            className: 'custom-toast',
            description: data?.content || 'Click to view new posts',
            action: {
              label: 'View Notifications',
              onClick: () => {
                navigate('/notifications');
              }
            }
          });
        });

        await signalRService.subscribetoIncomingCall((data) => {
          if (!mounted) return;
          console.log('SignalRProvider: Incoming call notification received:', data);
         
          setHasAcall(true);
          setName(data.patientName);
          setChannelName(data.channelName);
          setAppId(data.appId);
          setUid(data.uid);
          setPatientImage(data.imageURL);

          console.log(data.appId);
          // console.log(data.patientName);
          console.log(data.channelName);
          console.log(data.uid);
          console.log("hasAcall",hasAcall);
          if(hasAcall){
            console.log("receive a call");
            return<ReceiveCall />
          }
                              
        });

        console.log("SignalRProvider: SignalR initialization complete");
      } catch (error) {
        console.error('SignalR Provider: SignalR connection error:', error);
        if (!mounted) return;
        setIsConnected(false);
        setHasAcall(false);
      }
    };

    // Initialize SignalR when authenticated
    if(isAuthenticated){

      initializeSignalR();
    } else {
      console.log("SignalRProvider: Not authenticated, skipping initialization");
    }   

    // Cleanup function
    return () => {
      mounted = false;
      console.log("SignalR Provider: Cleaning up connection");
      
      if (signalRService.getConnection()?.connectionId) {
        signalRService.unsubscribeFromNewPostCreated(() => {
          console.log('SignalR Provider: Unsubscribed from notifications');
        });
        signalRService.stopConnection();
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, navigate]);

  return (
    <SignalRContext.Provider value={{ isConnected, PatientName, ChannelName, AppId, Uid, PatientImage, setHasAcall, hasAcall,hasUnreadNotifications, setHasUnreadNotifications }}>
      {children}
    </SignalRContext.Provider>
  );
};
