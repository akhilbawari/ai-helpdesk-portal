import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  useToast,
  Divider,
  Avatar,
  Flex,
  Button,
  Icon
} from '@chakra-ui/react';
import { TimeIcon, CheckIcon, InfoIcon, WarningIcon, RepeatIcon } from '@chakra-ui/icons';
import { dashboardService } from '@/services';
import { useNavigate } from 'react-router-dom';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActivity();
  }, [limit]);

  const fetchRecentActivity = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getRecentActivity(limit);
      setActivities(data);
    } catch (error) {
      toast({
        title: 'Error fetching recent activity',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'TICKET_CREATED':
        return <InfoIcon color="blue.500" />;
      case 'TICKET_UPDATED':
        return <TimeIcon color="orange.500" />;
      case 'TICKET_CLOSED':
        return <CheckIcon color="green.500" />;
      case 'TICKET_REOPENED':
        return <RepeatIcon color="purple.500" />;
      case 'RESPONSE_ADDED':
        return <Icon name="chat" color="teal.500" />;
      default:
        return <WarningIcon color="gray.500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'TICKET_CREATED':
        return 'blue';
      case 'TICKET_UPDATED':
        return 'orange';
      case 'TICKET_CLOSED':
        return 'green';
      case 'TICKET_REOPENED':
        return 'purple';
      case 'RESPONSE_ADDED':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const formatActivityType = (type) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {activities.length === 0 ? (
          <Text textAlign="center" py={8}>No recent activity found</Text>
        ) : (
          activities.map((activity, index) => (
            <Box key={activity.id || index}>
              <HStack spacing={4} align="flex-start" onClick={() => {
                if (activity.ticketId) {
                  navigate(`/tickets/${activity.ticketId}`);
                }
              }} cursor={activity.ticketId ? 'pointer' : 'default'}>
                <Avatar 
                  size="sm" 
                  name={activity.userName} 
                  src={activity.userAvatar}
                  bg={`${getActivityColor(activity.activityType)}.500`}
                  icon={getActivityIcon(activity.activityType)}
                />
                
                <Box flex="1">
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontWeight="bold">{activity.userName}</Text>
                    <Text fontSize="sm" color="gray.500">{formatTimeAgo(activity.timestamp)}</Text>
                  </Flex>
                  
                  <HStack mb={1}>
                    <Badge colorScheme={getActivityColor(activity.activityType)}>
                      {formatActivityType(activity.activityType)}
                    </Badge>
                    {activity.department && (
                      <Badge colorScheme="gray">{activity.department.replace('_', ' ')}</Badge>
                    )}
                  </HStack>
                  
                  <Text>{activity.description}</Text>
                  
                  {activity.ticketTitle && (
                    <Text fontSize="sm" fontStyle="italic" mt={1}>
                      Ticket: {activity.ticketTitle}
                    </Text>
                  )}
                </Box>
              </HStack>
              
              {index < activities.length - 1 && <Divider my={4} />}
            </Box>
          ))
        )}
      </VStack>
      
      {activities.length > 0 && (
        <Button 
          mt={6} 
          size="sm" 
          onClick={() => setLimit(prev => prev + 10)}
          isLoading={isLoading}
          variant="outline"
          width="full"
        >
          Load More
        </Button>
      )}
    </Box>
  );
};

export default RecentActivity;
