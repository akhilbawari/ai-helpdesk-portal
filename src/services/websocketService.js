import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import authService from './authService';
import { API_BASE_URL } from '@/utils/constants';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.connected && this.stompClient) {
        resolve();
        return;
      }

      const socket = new SockJS(`${API_BASE_URL}/ws`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = null; // Disable console logs

      const headers = {};
      const token = authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      this.stompClient.connect(
        headers,
        () => {
          console.log('WebSocket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          
          // Resubscribe to previous topics if any
          this.subscriptions.forEach((callback, topic) => {
            this.subscribe(topic, callback);
          });
          
          resolve();
        },
        (error) => {
          console.error('WebSocket connection error:', error);
          this.connected = false;
          this.handleReconnect();
          reject(error);
        }
      );
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect()
          .catch(() => {
            // Error handling is done in connect method
          });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnect attempts reached. Please refresh the page.');
    }
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
      this.subscriptions.clear();
      console.log('WebSocket disconnected');
    }
  }

  subscribe(topic, callback) {
    if (!this.connected) {
      // Store subscription for when connection is established
      this.subscriptions.set(topic, callback);
      this.connect()
        .catch(error => console.error('Failed to connect for subscription:', error));
      return;
    }

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        callback(message.body);
      }
    });

    this.subscriptions.set(topic, callback);
    return subscription;
  }

  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  subscribeToTicket(ticketId, callback) {
    return this.subscribe(`/topic/ticket/${ticketId}`, callback);
  }

  subscribeToUserNotifications(userId, callback) {
    return this.subscribe(`/topic/user/${userId}`, callback);
  }

  subscribeToDepartment(department, callback) {
    return this.subscribe(`/topic/department/${department}`, callback);
  }

  subscribeToAllTickets(callback) {
    return this.subscribe('/topic/tickets', callback);
  }

  send(destination, body) {
    if (!this.connected) {
      return this.connect()
        .then(() => {
          this.stompClient.send(destination, {}, JSON.stringify(body));
        })
        .catch(error => console.error('Failed to connect for sending message:', error));
    }

    this.stompClient.send(destination, {}, JSON.stringify(body));
  }
}

const websocketService = new WebSocketService();
export default websocketService;
