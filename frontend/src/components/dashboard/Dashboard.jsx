import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  useToast,
  Select,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Card,
  CardHeader,
  CardBody,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import apiService from '@/services/apiService';
import TicketStatusChart from './TicketStatusChart';
import DepartmentPerformanceChart from './DepartmentPerformanceChart';
import RecentActivity from './RecentActivity';
import AIPatterns from './AIPatterns';
import { USER_ROLES } from '@/utils/constants';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import SupportDashboard from '@/pages/dashboard/SupportDashboard';
import EmployeeDashboard from '@/pages/dashboard/EmployeeDashboard';

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState('WEEK');
  const [isLoading, setIsLoading] = useState(true);
  const [ticketsByStatus, setTicketsByStatus] = useState([]);
  const [ticketsByDepartment, setTicketsByDepartment] = useState([]);
  const [ticketsByPriority, setTicketsByPriority] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [aiAccuracy, setAiAccuracy] = useState(null);
  const [error, setError] = useState(null);
  
  const toast = useToast();

  const [userData, setUserData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Check user role and fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Debug: Check what's in localStorage
        const userDataStr = localStorage.getItem('user_data');
        const userInfoStr = localStorage.getItem('user_info');
        console.log('Raw localStorage contents:', {
          user_data: userDataStr,
          user_info: userInfoStr
        });
        
        // Get user role
        const role = apiService.getUserRole();
        console.log('Current user role from apiService:', role);
        setUserRole(role);
        
        // Get user data from localStorage
        let user = null;
        if (userDataStr) {
          user = JSON.parse(userDataStr);
        } else if (userInfoStr) {
          user = JSON.parse(userInfoStr);
        }
        
        if (user) {
          console.log('User data from localStorage:', user);
          setUserData(user);
          
          // Fetch user profile
          const { data, error } = await apiService.getCurrentUserProfile();
          if (error) {
            console.error('Error fetching user profile:', error);
            toast({
              title: 'Error fetching profile',
              description: error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          } else if (data) {
            console.log('User profile fetched:', data);
            setUserProfile(data);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [toast]);

  // Redirect to role-specific dashboards
  if (!isLoading && userRole) {
    console.log('Redirecting based on role:', userRole);
    console.log('Passing user data:', userData);
    console.log('Passing user profile:', userProfile);
    
    if (userRole === USER_ROLES.ADMIN) {
      return <AdminDashboard user={userData} profile={userProfile} />;
    } else if (userRole === USER_ROLES.SUPPORT) {
      return <SupportDashboard user={userData} profile={userProfile} />;
    } else if (userRole === USER_ROLES.EMPLOYEE || userRole === 'EMPLOYEE') {
      return <EmployeeDashboard user={userData} profile={userProfile} />;
    } else {
      // Default to employee dashboard for any other role
      console.log('Using default employee dashboard for role:', userRole);
      return <EmployeeDashboard user={userData} profile={userProfile} />;
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="500px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  // Show error if no role is detected
  if (!userRole) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        mt="4"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Authentication Error
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Unable to determine your user role. Please try logging out and logging back in.
        </AlertDescription>
      </Alert>
    );
  }

  // This fallback should never be reached due to the redirects above
  return (
    <Box p={4}>
      <Alert
        status="info"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Redirecting to Dashboard
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          You will be redirected to the appropriate dashboard based on your role.
        </AlertDescription>
      </Alert>
    </Box>
  );
};

export default Dashboard;
