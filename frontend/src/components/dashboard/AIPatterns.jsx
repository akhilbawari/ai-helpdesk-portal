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
  Heading,
  Card,
  CardHeader,
  CardBody,
  List,
  ListItem,
  ListIcon,
  Button,
  Flex,
  Icon
} from '@chakra-ui/react';
import { InfoIcon, WarningIcon, RepeatIcon, CheckIcon } from '@chakra-ui/icons';
import { dashboardService } from '@/services';

const AIPatterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const toast = useToast();

  useEffect(() => {
    fetchAIPatterns();
  }, []);

  const fetchAIPatterns = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getAIPatterns();
      setPatterns(data);
    } catch (error) {
      toast({
        title: 'Error fetching AI patterns',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toUpperCase()) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'orange';
      case 'LOW':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const getPatternIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'ISSUE':
        return WarningIcon;
      case 'TREND':
        return RepeatIcon;
      case 'IMPROVEMENT':
        return CheckIcon;
      default:
        return InfoIcon;
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      {patterns.length === 0 ? (
        <Text textAlign="center" py={8}>No patterns detected yet</Text>
      ) : (
        <VStack spacing={6} align="stretch">
          {patterns.map((pattern, index) => (
            <Card key={index} variant="outline">
              <CardHeader pb={2}>
                <HStack>
                  <Icon as={getPatternIcon(pattern.type)} color={`${getSeverityColor(pattern.severity)}.500`} boxSize={5} />
                  <Heading size="md">{pattern.title}</Heading>
                  <Badge colorScheme={getSeverityColor(pattern.severity)} ml="auto">
                    {pattern.severity}
                  </Badge>
                </HStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <Text mb={3}>{pattern.description}</Text>
                
                {pattern.affectedSystems && pattern.affectedSystems.length > 0 && (
                  <Box mb={3}>
                    <Text fontWeight="medium" mb={1}>Affected Systems:</Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {pattern.affectedSystems.map((system, idx) => (
                        <Badge key={idx} colorScheme="gray" variant="solid">
                          {system}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
                
                {pattern.suggestedActions && pattern.suggestedActions.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={1}>Suggested Actions:</Text>
                    <List spacing={1}>
                      {pattern.suggestedActions.map((action, idx) => (
                        <ListItem key={idx}>
                          <ListIcon as={CheckIcon} color="green.500" />
                          {action}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                <Text fontSize="sm" color="gray.500" mt={3}>
                  Detected {new Date(pattern.detectedAt).toLocaleDateString()} • 
                  Based on {pattern.ticketCount} tickets
                </Text>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
      
      <Button 
        mt={6} 
        colorScheme="blue" 
        onClick={fetchAIPatterns}
        isLoading={isLoading}
        width="full"
      >
        Refresh Patterns
      </Button>
    </Box>
  );
};

export default AIPatterns;
