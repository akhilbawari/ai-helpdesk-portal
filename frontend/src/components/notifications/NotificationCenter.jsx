import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Flex,
  Heading,
  useColorModeValue,
  Circle,
  Tooltip
} from '@chakra-ui/react';
import { BellIcon, CheckIcon, InfoIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    markNotificationAsRead, 
    clearNotifications, 
    getUnreadCount 
  } = useNotifications();
  
  const navigate = useNavigate();
  const unreadCount = getUnreadCount();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    
    // Navigate to the relevant page based on notification type
    if (notification.ticketId) {
      navigate(`/tickets/${notification.ticketId}`);
    } else if (notification.type === 'KNOWLEDGE_UPDATE') {
      navigate(`/knowledge/${notification.documentId}`);
    }
    
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TICKET_CREATED':
      case 'KNOWLEDGE_CREATED':
        return <InfoIcon color="blue.500" />;
      case 'TICKET_UPDATED':
      case 'KNOWLEDGE_UPDATED':
        return <TimeIcon color="orange.500" />;
      case 'TICKET_CLOSED':
        return <CheckIcon color="green.500" />;
      case 'RESPONSE_ADDED':
        return <InfoIcon color="teal.500" />;
      case 'TICKET_ASSIGNED':
        return <InfoIcon color="purple.500" />;
      default:
        return <WarningIcon color="gray.500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      placement="bottom-end"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            variant="ghost"
            fontSize="20px"
          />
          {unreadCount > 0 && (
            <Circle
              size="18px"
              bg="red.500"
              color="white"
              fontSize="xs"
              fontWeight="bold"
              position="absolute"
              top="-5px"
              right="-5px"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Circle>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent
        width="350px"
        maxH="500px"
        overflowY="auto"
        shadow="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <PopoverArrow />
        <PopoverCloseButton />
        
        <PopoverHeader borderBottomWidth="1px" fontWeight="bold">
          <Flex justify="space-between" align="center">
            <Heading size="sm">Notifications</Heading>
            {unreadCount > 0 && (
              <Badge colorScheme="red" borderRadius="full" px={2}>
                {unreadCount} new
              </Badge>
            )}
          </Flex>
        </PopoverHeader>
        
        <PopoverBody p={0}>
          {notifications.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500">No notifications</Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {notifications.map((notification, index) => (
                <Box
                  key={notification.id || index}
                  p={3}
                  bg={notification.read ? bgColor : 'blue.50'}
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <HStack spacing={3} align="flex-start">
                    <Box pt={1}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    
                    <Box flex="1">
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontWeight={notification.read ? 'normal' : 'bold'} fontSize="sm">
                          {notification.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatTimeAgo(notification.timestamp)}
                        </Text>
                      </Flex>
                      
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {notification.message}
                      </Text>
                      
                      {notification.source && (
                        <Badge size="sm" colorScheme={
                          notification.source === 'department' ? 'green' : 
                          notification.source === 'admin' ? 'purple' : 'blue'
                        } mt={1}>
                          {notification.source}
                        </Badge>
                      )}
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
        
        <PopoverFooter borderTopWidth="1px">
          <Flex justify="space-between">
            <Tooltip label="Mark all as read">
              <Button size="sm" variant="ghost" leftIcon={<CheckIcon />} onClick={() => {
                notifications.forEach(n => markNotificationAsRead(n.id));
              }}>
                Mark all read
              </Button>
            </Tooltip>
            
            <Tooltip label="Clear all notifications">
              <Button size="sm" variant="ghost" colorScheme="red" onClick={clearNotifications}>
                Clear all
              </Button>
            </Tooltip>
          </Flex>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
