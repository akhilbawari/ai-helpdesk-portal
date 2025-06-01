import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiService } from '../../services';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiUser, FiUsers, FiClock, FiEye, FiArrowRight, FiPlus, 
         FiInbox, FiSettings, FiBarChart2, FiUserPlus, FiEdit, FiCalendar, FiZap } from 'react-icons/fi';

export default function AdminDashboard({ user, profile }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    totalUsers: 0,
    departments: {
      IT: 0,
      HR: 0,
      ADMIN: 0
    }
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [patternAlerts, setPatternAlerts] = useState([]);


  useEffect(() => {
    if (user) {
      fetchAdminDashboardData();
    }
  }, [user]);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin dashboard data...');
      
      // Fetch dashboard overview - this is an admin-only API that will be role-checked by apiService
      const { data: dashboardData, error: dashboardError } = await apiService.getDashboardOverview();
      if (dashboardError) {
        if (dashboardError.statusCode === 403) {
          toast.error('You do not have permission to view admin dashboard data');
          return;
        }
        throw dashboardError;
      }
      
      console.log('Dashboard overview data:', dashboardData);
      
      // Fetch all tickets - admin-only API with role checking
      const { data: ticketsData, error: ticketsError } = await apiService.getAllTickets();
      if (ticketsError) throw ticketsError;
      
      console.log('Tickets data:', ticketsData);
      
      // Fetch all profiles - admin-only API with role checking
      const { data: usersData, error: usersError } = await apiService.getAllUsers();
      if (usersError) throw usersError;
      
      console.log('Users data:', usersData);
      
      // Extract data from the dashboard overview
      let totalTickets = 0;
      let openTickets = 0;
      let departmentStats = { IT: 0, HR: 0, ADMIN: 0 };
      
      if (dashboardData) {
        // Get total tickets from dashboard overview
        totalTickets = dashboardData.totalTickets || 0;
        
        // Get open tickets count from ticketsByStatus
        if (dashboardData.ticketsByStatus && dashboardData.ticketsByStatus.OPEN) {
          openTickets = dashboardData.ticketsByStatus.OPEN;
        }
        
        // Get department statistics
        if (dashboardData.ticketsByDepartment) {
          departmentStats = {
            IT: dashboardData.ticketsByDepartment.IT || 0,
            HR: dashboardData.ticketsByDepartment.HR || 0,
            ADMIN: dashboardData.ticketsByDepartment.ADMIN || 0
          };
        }
      }
      
      // Calculate total users from users data
      const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
      
      // Ensure we have arrays to work with for recent items
      const tickets = Array.isArray(ticketsData) ? ticketsData : [];
      const users = Array.isArray(usersData) ? usersData : [];
      
      // Get recent tickets and users
      const recentTicketsData = tickets.slice(0, 5);
      const recentUsersData = users.slice(0, 5);
      
      console.log('Setting stats:', { 
        totalTickets, 
        openTickets, 
        totalUsers, 
        departments: departmentStats 
      });
      
      // Update the stats state
      setStats({
        totalTickets,
        openTickets,
        totalUsers,
        departments: departmentStats
      });
      
      // Get AI pattern detection - admin-only API with role checking
      const { data: patternData, error: patternError } = await apiService.detectPatterns(tickets);
      if (patternError) {
        console.error('Error fetching pattern data:', patternError);
        setPatternAlerts([]);
      } else if (patternData) {
        console.log('Pattern detection data:', patternData);
        
        // Handle the pattern detection response format
        if (patternData.patternDetected) {
          // Create a formatted alert from the pattern data
          const patternAlert = {
            title: patternData.issueType || 'Pattern Detected',
            description: patternData.suggestedAction || 'A pattern was detected in your tickets',
            severity: 'warning',
            confidence: patternData.confidence || 0.5,
            occurrences: patternData.occurrences || 0,
            affectedSystems: patternData.affectedSystems || [],
            timestamp: new Date().toISOString()
          };
          setPatternAlerts([patternAlert]);
        } else {
          setPatternAlerts([]);
        }
      } else {
        setPatternAlerts([]);
      }
      
      setRecentTickets(recentTicketsData);
      setRecentUsers(recentUsersData);
      
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-coral-100 text-coral-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-beige-100 text-beige-800';
      default:
        return 'bg-beige-100 text-beige-800';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-indigo-100 text-indigo-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-beige-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-beige-100 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-beige-100 rounded-lg"></div>
          <div className="h-64 bg-beige-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Admin Dashboard</h1>
        <p className="text-navy-600">Welcome back! Here's an overview of your helpdesk system.</p>
      </div>
      
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-beige-500 to-beige-600 h-2"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-navy-600 mb-1">Total Tickets</h3>
                <p className="text-3xl font-bold text-navy-900">{stats.totalTickets}</p>
              </div>
              <div className="bg-beige-100 p-3 rounded-full">
                <svg className="w-7 h-7 text-beige-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-navy-600 mb-1">Open Tickets</h3>
                <p className="text-3xl font-bold text-navy-900">{stats.openTickets}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-navy-600 mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-navy-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-navy-600 mb-1">AI Suggestions</h3>
                <p className="text-3xl font-bold text-navy-900">12</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center">
          <FiZap className="mr-2 text-indigo-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/admin/users" 
              className="flex items-center p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 h-full"
            >
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FiUsers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Manage Users</h3>
                <p className="text-xs text-white/80">View and edit user accounts</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/admin/tickets" 
              className="flex items-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 h-full"
            >
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">All Tickets</h3>
                <p className="text-xs text-white/80">Manage support requests</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/admin/reports" 
              className="flex items-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 h-full"
            >
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FiBarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Reports</h3>
                <p className="text-xs text-white/80">View analytics and metrics</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/admin/settings" 
              className="flex items-center p-4 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 h-full"
            >
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FiSettings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Settings</h3>
                <p className="text-xs text-white/80">Configure system options</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Department Performance & Pattern Detection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Department Statistics */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1"></div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-navy-900">Department Statistics</h2>
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm font-medium text-navy-700">IT Department</span>
                  </div>
                  <span className="text-sm font-medium text-navy-600">{stats.departments.IT} tickets</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stats.departments.IT / Math.max(1, stats.totalTickets)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium text-navy-700">HR Department</span>
                  </div>
                  <span className="text-sm font-medium text-navy-600">{stats.departments.HR} tickets</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stats.departments.HR / Math.max(1, stats.totalTickets)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm font-medium text-navy-700">Admin Department</span>
                  </div>
                  <span className="text-sm font-medium text-navy-600">{stats.departments.ADMIN} tickets</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stats.departments.ADMIN / Math.max(1, stats.totalTickets)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link to="/admin/reports" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                View Detailed Reports
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Pattern Detection Alerts */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1"></div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-navy-900">AI Pattern Detection</h2>
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            {patternAlerts.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pattern alerts detected</h3>
                <p className="mt-1 text-sm text-gray-500">Our AI hasn't detected any unusual patterns in your tickets</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patternAlerts.map((alert, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-purple-500 bg-purple-50">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 w-full">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-purple-800">{alert.title}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
                            {Math.round(alert.confidence * 100)}% confidence
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-700">
                          <p className="font-medium">Suggested Action:</p>
                          <p className="mb-2">{alert.description}</p>
                          
                          <p className="font-medium">Affected Systems:</p>
                          <ul className="list-disc pl-5 mb-2">
                            {alert.affectedSystems.map((system, idx) => (
                              <li key={idx}>{system}</li>
                            ))}
                          </ul>
                          
                          <div className="flex items-center mt-2">
                            <span className="text-purple-700 font-medium">Occurrences:</span>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
                              {alert.occurrences} tickets
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link to="/admin/patterns" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors duration-300">
                View All Patterns
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-1"></div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-navy-900 flex items-center">
                <FiMessageSquare className="mr-2 text-indigo-500" /> Recent Tickets
              </h2>
              <Link to="/admin/tickets" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                View All
                <FiArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {recentTickets.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-indigo-50 rounded-lg p-8 text-center"
              >
                <FiInbox className="w-16 h-16 text-indigo-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-navy-800 mb-1">No recent tickets</h3>
                <p className="text-navy-600 mb-4">Tickets will appear here as they are created</p>
                <Link 
                  to="/tickets/new" 
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create New Ticket
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(recentTickets) && recentTickets.map((ticket, index) => (
                  <motion.div 
                    key={ticket.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 3 }}
                    className="bg-gradient-to-r from-white to-indigo-50 rounded-lg p-4 border border-indigo-100 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(ticket.status).includes('green') ? 'bg-green-500' : getStatusColor(ticket.status).includes('red') ? 'bg-red-500' : getStatusColor(ticket.status).includes('yellow') ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                          <h4 className="font-medium text-navy-900 truncate">{ticket.title}</h4>
                        </div>
                        <p className="text-sm text-navy-600 flex items-center">
                          <FiUser className="w-3 h-3 mr-1 text-navy-400" /> {ticket.createdByName || 'Unknown'}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {ticket.category || 'Uncategorized'}
                          </span>
                          <span className="text-xs text-navy-500 ml-3 flex items-center">
                            <FiClock className="w-3 h-3 mr-1" /> {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-start">
                        <Link to={`/tickets/${ticket.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all">
                          <FiEye className="w-3.5 h-3.5 mr-1" /> View
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Recent Users */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-1"></div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-navy-900 flex items-center">
                <FiUsers className="mr-2 text-purple-500" /> Recent Users
              </h2>
              <Link to="/admin/users" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors">
                View All
                <FiArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {recentUsers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-purple-50 rounded-lg p-8 text-center"
              >
                <FiUsers className="w-16 h-16 text-purple-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-navy-800 mb-1">No users found</h3>
                <p className="text-navy-600 mb-4">New users will appear here when they register</p>
                <Link 
                  to="/admin/users/new" 
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <FiUserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(recentUsers) && recentUsers.map((user, index) => (
                  <motion.div 
                    key={user.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 3 }}
                    className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm"
                  >
                    <div className="flex items-center">
                      <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                        <FiUser className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-navy-900">{user.fullName}</h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center">
                            <FiSettings className="w-3 h-3 mr-1" /> {user.department}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full flex items-center">
                            <FiBarChart2 className="w-3 h-3 mr-1" /> {user.role}
                          </span>
                          <span className="text-xs text-navy-500 flex items-center">
                            <FiCalendar className="w-3 h-3 mr-1" /> {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/admin/users/${user.id}`} className="text-purple-600 hover:text-purple-800 font-medium text-sm inline-flex items-center bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all">
                          <FiEye className="w-3.5 h-3.5 mr-1" /> View
                        </Link>
                        <Link to={`/admin/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all">
                          <FiEdit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
