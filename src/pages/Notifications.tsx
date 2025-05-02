
import React, { useEffect, useState } from 'react';
import { NotificationData, NotificationService } from '../services/NotificationService';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getTimeAgo } from '@/utils/dateUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSignalR } from '../hooks/useSignalR';
import { AppConfig } from '../../config';

const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [notificationData, setNotificationData] = useState<NotificationData[]|null>(null);
  const {user} = useAuth();
  const {hasUnreadNotifications,setHasUnreadNotifications} = useSignalR();
  


const serverURL = AppConfig.baseUrl;

  useEffect(()=>{
    const fetchNotificationData = async () => {
      try {
        setLoading(true);
        const data = await NotificationService.getNotificaitons();
        if(data.length === undefined) return;
        console.log("dataLeght is ", data.length);
        setNotificationData(data);
console.log(data.map(notification=>notification.id))
      
      } catch (error) {
        console.error('Error fetching Notification data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationData();
  }
  ,[])

  // mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      const updatedData = notificationData?.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      );
      setNotificationData(updatedData);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllNotificationsAsRead();
      const updatedData = notificationData?.map(notification => ({ ...notification, isRead: true }));
      setNotificationData(updatedData);
      setHasUnreadNotifications(false);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
      
    }
  };

  // clear notification
  const clearNotification = async (notificationId: number) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      const updatedData = notificationData?.filter((notification) => notification.id !== notificationId);
      setNotificationData(updatedData);
      setHasUnreadNotifications(false);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error clearing notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // clear all notifications
  const clearAllNotifications = async () => {
    try {
      await NotificationService.deleteAllNotifications();
      setNotificationData([]);
      setHasUnreadNotifications(false)
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('Failed to clear all notifications');
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
        {notificationData && notificationData.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Mark All as Read
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllNotifications}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[600px] rounded-lg border">
        {/* check if notificationData is empty */}
        {notificationData?.length === undefined ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
            <Bell className="h-12 w-12 mb-4" />
            <p className="text-lg">No notifications yet</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {notificationData?.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={`${serverURL+notification.profileImageUrl}`} 
                        alt="User" 
                      />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    {/**Card details */}
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{notification.patientName}</p>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/**Mark as read button */}
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Mark as read
                      </Button>
                    )}
                    {/**Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearNotification(notification.id)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Notifications;
