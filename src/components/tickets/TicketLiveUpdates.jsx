import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Collapse,
  Button,
  Icon,
  Fade,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton
} from '@chakra-ui/react';
import { InfoIcon, TimeIcon, RepeatIcon } from '@chakra-ui/icons';
import { useNotifications } from '@/components/notifications/NotificationProvider';

const TicketLiveUpdates = ({ ticketId }) => {
  const { isConnected, setActiveTicket, ticketUpdates } = useNotifications();
  const [updates, setUpdates] = useState([]);
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  // Set this ticket as active for WebSocket updates
  useEffect(() => {
    if (ticketId) {
      setActiveTicket(ticketId);
    }
  }, [ticketId, setActiveTicket]);

  // Process updates from WebSocket
  useEffect(() => {
    if (ticketUpdates[ticketId]) {
      setUpdates(ticketUpdates[ticketId]);
      if (ticketUpdates[ticketId].length > 0 && !isOpen) {
        setHasNewUpdates(true);
      }
    }
  }, [ticketId, ticketUpdates, isOpen]);

  const handleViewUpdates = () => {
    setHasNewUpdates(false);
    onToggle();
  };

  if (!isConnected) {
    return (
      <Alert status="warning" variant="subtle" borderRadius="md" mb={4}>
        <AlertIcon />
        <AlertTitle mr={2}>Not connected to real-time updates</AlertTitle>
        <AlertDescription>
          You may need to refresh to see the latest changes.
        </AlertDescription>
      </Alert>
    );
  }

  if (updates.length === 0 && !hasNewUpdates) {
    return null;
  }

  return (
    <Box mb={4}>
      {hasNewUpdates && !isOpen && (
        <Fade in={hasNewUpdates}>
          <Alert status="info" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>New updates available</AlertTitle>
            <AlertDescription>
              This ticket has been updated in real-time.
            </AlertDescription>
            <Button 
              ml="auto" 
              size="sm" 
              colorScheme="blue" 
              onClick={handleViewUpdates}
            >
              View Updates
            </Button>
          </Alert>
        </Fade>
      )}

      <Collapse in={isOpen} animateOpacity>
        <Box 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          borderColor="blue.200"
          bg="blue.50"
          position="relative"
        >
          <CloseButton 
            position="absolute" 
            right="8px" 
            top="8px" 
            onClick={onClose} 
          />
          
          <Text fontWeight="bold" mb={3}>
            Live Updates ({updates.length})
          </Text>
          
          <VStack spacing={3} align="stretch">
            {updates.map((update, index) => (
              <HStack 
                key={index} 
                bg="white" 
                p={3} 
                borderRadius="md" 
                borderWidth="1px"
                borderColor="gray.200"
                spacing={3}
              >
                <Icon 
                  as={update.type === 'STATUS_CHANGE' ? TimeIcon : 
                      update.type === 'RESPONSE_ADDED' ? InfoIcon : RepeatIcon} 
                  color="blue.500" 
                  boxSize={5}
                />
                
                <Box flex="1">
                  <HStack mb={1}>
                    <Text fontWeight="bold">{update.title}</Text>
                    <Badge colorScheme="blue">{update.type.replace('_', ' ')}</Badge>
                  </HStack>
                  
                  <Text fontSize="sm">{update.message}</Text>
                  
                  {update.user && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      By {update.user} • {new Date(update.timestamp).toLocaleTimeString()}
                    </Text>
                  )}
                </Box>
              </HStack>
            ))}
          </VStack>
          
          <Button 
            size="sm" 
            variant="ghost" 
            colorScheme="blue" 
            mt={3} 
            onClick={() => window.location.reload()}
          >
            Refresh page to apply updates
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

export default TicketLiveUpdates;
