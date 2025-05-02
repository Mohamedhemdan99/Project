import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { AppConfig } from '../../config';

const serverURL = AppConfig.baseUrl;

export const signalRService = {
  connection: null as HubConnection | null,

  async startConnection(): Promise<void> {
    // console.log(localStorage.getItem('token'));
    const token = localStorage.getItem('token');
    this.connection = new HubConnectionBuilder()
    // add header with token
    .withUrl(`${serverURL}notificationHub`, {
      accessTokenFactory: () => token || '',
      // Remove accessTokenFactory since we’ll use headers
      transport: HttpTransportType.WebSockets, // Prefer WebSockets
      headers: {
        Authorization: `Bearer ${token}` // Send token in Authorization header
      }//, withCredentials:true
    })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      
      .build();
// console.log("Connection Hub ID:",this.connection.connectionId);
    // Start the connection
    await this.connection.start();
    // console.log("Connection Id From SignalRService:",this.connection.connectionId);
    // Handle connection events
  },

  async stopConnection(): Promise<void> {
    if (this.connection?.connectionId) {
      await this.connection.stop();
    }
  },

  // impelement getConnection()
  getConnection(): HubConnection | null {
    return this.connection;
  },
  
  async joinOnlineHelpersGroup(): Promise<void> {
    if (this.connection?.connectionId) {
      // console.log(this.connection.connectionId);

      await this.connection.invoke('JoinOnlineHelpersGroup');
      console.log(`User${localStorage.getItem("userId")} joined to the "OnlineGroup"`);
    }
  },

  async subscribetoIncomingCall(handler: (data: any) => void): Promise<void> {
    if (this.connection?.connectionId) {
      // console.log('SignalR Service: Subscribing to IncomingCall', this.connection.connectionId);
      this.connection.on('IncomingCall',handler);
        //  (data) => {
      //   console.log('SignalR Service: IncomingCall event received:', data);
      //   console.log("Data.AppId:",data.appId);
      //   // window.location.href = '/receive-call';
      //   // handler(data);
      // });
    } else {
      console.error('SignalR Service: No SignalR connection available');
    }
  },

  async unsubscribeFromIncomingCall(): Promise<void> {
    if (this.connection?.connectionId) {
      console.log('SignalR Service: Unsubscribing from IncomingCall');
      this.connection.off('IncomingCall');
    } else {
      console.error('SignalR Service: No SignalR connection available');
    }
  },

  async subscribeToNewPostCreated(handler: (data: any) => void): Promise<void> {
    if (this.connection?.connectionId) {
      console.log('SignalR Service: Subscribing to NewPostCreated');
      this.connection.on('NewPostCreated', (data) => {
        console.log('SignalR Service: NewPostCreated event received:', data);
        handler(data);
      });  
    } else {
      console.error('SignalR Service: No SignalR connection available');
    }  
  },  
  // impelement UnSubscribetoNewPostCreated()
async unsubscribeFromNewPostCreated(handler: () => void): Promise<void> {
  if (this.connection?.connectionId) {
    this.connection.off('NewPostCreated', handler);
    console.log('SignalR Service: Unsubscribed from NewPostCreated');
  }  
}  
,



  // implement leave online helpers group
  async leaveOnlineHelpersGroup(): Promise<void> {
    if (this.connection?.connectionId) {
      await this.connection.invoke('LeaveOnlineHelpersGroup');
      console.log(`User${localStorage.getItem("userId")} Left OnlineHelpersGroup"`);
    }
  }
  
};