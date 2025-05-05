// src/contexts/AuthProvider.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContext } from './AuthContext';
import { authService, LoginFormData, SignUpFormData } from '../services/authService';
import { signalRService } from '../services/signalRService';
import { profileService,ProfileData } from '@/services/profileService';


export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
      const checkAuthStatus = async () => {
        try {
          setIsLoading(true);
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          const isAuth = authService.isAuthenticated();

          if (!isAuth) {
            console.log("checkAuthStatus: Not Authenticated");
            setToken(null);
            setUser(null);
            return;
          }

          console.log("checkAuthStatus: Authenticated");
          setToken(storedToken);

          if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log("checkAuthStatus: Using stored user data", userData);
            localStorage.setItem('imageURL', userData.profileImageUrl);
            localStorage.setItem('fullName', userData.fullName);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            // Try to fetch fresh data if parsing fails
            try {
              const freshUserData = await profileService.getProfileData();
              if (freshUserData) {
                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
                console.log("checkAuthStatus: Using fresh user data", freshUserData);
                localStorage.setItem('imageURL', freshUserData.profileImageUrl);
                localStorage.setItem('fullName', freshUserData.fullName);
                }
            } catch (fetchError) {
              console.error('Error fetching fresh user data:', fetchError);
              // Clear invalid session data
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              navigate('/login');
            }
          }
        } else {
          // No stored user data, fetch fresh
          try {
            const freshUserData = await profileService.getProfileData();
            if (freshUserData) {
              setUser(freshUserData);
              localStorage.setItem('user', JSON.stringify(freshUserData));
              console.log("checkAuthStatus: Using fresh user data", freshUserData);
              localStorage.setItem('imageURL', freshUserData.profileImageUrl);
              localStorage.setItem('fullName', freshUserData.fullName);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            setToken(null);
            setUser(null);
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Authentication status check failed:', error);
        toast.error('Session initialization failed');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const login = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);

      if (response.token && response.userId) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        // localStorage.setItem('imageURL', response.imageURL);
        // localStorage.setItem('fullName', response.fullName);
        
        // Fetch and store user profile
        const userData = await profileService.getProfileData();
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      await authService.register(data);
      toast.success('Registration successful! Please login.', { icon: '✅' });
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      // toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (signalRService.getConnection()?.connectionId) {
        await signalRService.unsubscribeFromNewPostCreated(() => {
          console.log('SignalRProvider: Unsubscribed from notifications');
        });
        await signalRService.leaveOnlineHelpersGroup();
        await signalRService.stopConnection();
      }

      authService.logout();
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      navigate('/');
      toast.info('You have been logged out', { icon: '👋' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}