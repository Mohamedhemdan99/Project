import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signalRService } from '../services/signalRService.ts';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignalRContext } from './SiganlRContext.ts';
import { useAuth } from '@/hooks/useAuth.ts';
import ReceiveCall from '@/pages/ReceiveCall.tsx';

// List of routes where we should disable call handling
const DISABLED_ROUTES = ['/VideoCallScreen', '/Translation'];

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [hasAcall, setHasAcall] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [PatientName, setName] = useState('');
  const [ChannelName, setChannelName] = useState('');
  const [AppId, setAppId] = useState('');
  const [Uid, setUid] = useState(0);
  const [PatientImage, setPatientImage] = useState('');
  const [ReceiverName, setReceiverName] = useState('');

  // Check if current route is in disabled list - memoize this check
  const isDisabledRoute = DISABLED_ROUTES.includes(location.pathname);

  // Handler for incoming calls - defined with useCallback to prevent recreation on each render
  const handleIncomingCall = useCallback((data) => {
    // Skip processing incoming calls if on a disabled route
    if (DISABLED_ROUTES.includes(location.pathname)) {
      console.log('SignalRProvider: Ignoring incoming call - on disabled route:', location.pathname);
      return;
    }
    
    console.log('SignalRProvider: Incoming call notification received:', data);
    setHasAcall(true);
    setName(data.patientName);
    setChannelName(data.channelName);
    setAppId(data.appId);
    setUid(data.uid);
    setPatientImage(data.imageURL);
  }, [location.pathname]);

  // Handle new posts - defined with useCallback
  const handleNewPost = useCallback((data) => {
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
  }, [navigate]);

  // Effect to reset call state when navigating to disabled routes
  useEffect(() => {
    if (isDisabledRoute && hasAcall) {
      console.log('Resetting call state due to navigation to disabled route');
      setHasAcall(false);
    }
  }, [location.pathname, isDisabledRoute, hasAcall]);

  // Main effect to establish SignalR connection - only depends on authentication state
  useEffect(() => {
    let mounted = true;

    const initializeSignalR = async () => {
      if (!isAuthenticated) {
        console.log("SignalRProvider: Not authenticated, skipping initialization");
        return;
      }

      try {
        console.log("SignalRProvider: Starting SignalR initialization");
        
        // Only start connection if not already connected
        if (!signalRService.isConnected()) {
          await signalRService.startConnection();
          
          if (!mounted) return;
          setIsConnected(true);
          
          await signalRService.joinOnlineHelpersGroup();
        }

        if (!mounted) return;

        // Subscribe to new post notifications
        await signalRService.subscribeToNewPostCreated(handleNewPost);

        // Subscribe to incoming calls
        await signalRService.subscribetoIncomingCall(handleIncomingCall);

        console.log("SignalRProvider: SignalR initialization complete");
      } catch (error) {
        console.error('SignalR Provider: SignalR connection error:', error);
        if (!mounted) return;
        setIsConnected(false);
        setHasAcall(false);
      }
    };

    // Initialize SignalR when authenticated
    if (isAuthenticated) {
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
  }, [isAuthenticated, handleNewPost, handleIncomingCall]); // Only reconnect when auth state changes or handlers change

  return (
    <SignalRContext.Provider value={{ 
      isConnected, 
      PatientName, 
      ChannelName, 
      AppId, 
      Uid, 
      PatientImage, 
      setHasAcall, 
      hasAcall,
      hasUnreadNotifications, 
      setHasUnreadNotifications 
    }}>
      {children}
      {/* Only render ReceiveCall if hasAcall is true AND we're not on a disabled route */}
      {hasAcall && !isDisabledRoute && <ReceiveCall />}
    </SignalRContext.Provider>
  );
};