import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { apiService } from '@/services';
import { useAuth } from '@/context/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketUpdates, setTicketUpdates] = useState({});
  
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket();
      
      return () => {
        apiService.disconnectWebSocket();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  // Subscribe to user-specific notifications
  useEffect(() => {
    if (isConnected && user) {
      // Subscribe to user's notifications
      apiService.subscribeToUserNotifications(user.id, handleUserNotification);
      
      // Subscribe to department notifications if user has a department
      if (user.department) {
        apiService.subscribeToDepartment(user.department, handleDepartmentNotification);
      }
      
      // If user is admin, subscribe to all tickets
      if (user.role === 'ADMIN') {
        apiService.subscribeToAllTickets(handleAllTicketsNotification);
      }
    }
  }, [isConnected, user]);

  // Subscribe to active ticket updates
  useEffect(() => {
    if (isConnected && activeTicketId) {
      apiService.subscribeToTicket(activeTicketId, handleTicketUpdate);
      
      return () => {
        apiService.unsubscribe(`/topic/ticket/${activeTicketId}`);
      };
    }
  }, [isConnected, activeTicketId]);

  const connectWebSocket = async () => {
    try {
      await apiService.connectWebSocket();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to real-time updates. Some features may be unavailable.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUserNotification = (notification) => {
    // Add notification to the list
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    
    // Show toast for important notifications
    if (notification.importance === 'HIGH') {
      toast({
        title: notification.title,
        description: notification.message,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDepartmentNotification = (notification) => {
    // Add notification to the list with department tag
    const departmentNotification = {
      ...notification,
      source: 'department',
    };
    
    setNotifications(prev => [departmentNotification, ...prev].slice(0, 50));
  };

  const handleAllTicketsNotification = (notification) => {
    // Only process if it's not already handled by other subscriptions
    const isDuplicate = notifications.some(n => 
      n.id === notification.id || 
      (n.ticketId === notification.ticketId && n.timestamp === notification.timestamp)
    );
    
    if (!isDuplicate) {
      const adminNotification = {
        ...notification,
        source: 'admin',
      };
      
      setNotifications(prev => [adminNotification, ...prev].slice(0, 50));
    }
  };

  const handleTicketUpdate = (update) => {
    // Store the update for the active ticket
    setTicketUpdates(prev => ({
      ...prev,
      [activeTicketId]: [...(prev[activeTicketId] || []), update]
    }));
    
    // Show toast for updates
    toast({
      title: update.title || 'Ticket Updated',
      description: update.message,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const setActiveTicket = (ticketId) => {
    // Unsubscribe from previous ticket if any
    if (activeTicketId && activeTicketId !== ticketId) {
      apiService.unsubscribe(`/topic/ticket/${activeTicketId}`);
    }
    
    setActiveTicketId(ticketId);
    
    // Clear updates for this ticket as they're now seen
    if (ticketId && ticketUpdates[ticketId]) {
      setTicketUpdates(prev => ({
        ...prev,
        [ticketId]: []
      }));
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const value = {
    notifications,
    isConnected,
    activeTicketId,
    ticketUpdates,
    setActiveTicket,
    markNotificationAsRead,
    clearNotifications,
    getUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
