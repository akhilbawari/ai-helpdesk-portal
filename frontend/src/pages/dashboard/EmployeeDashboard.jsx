import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiService } from '../../services';
import { FiAlertCircle, FiClock, FiCheckCircle, FiActivity, FiFilter, FiRefreshCw, 
         FiSearch, FiArrowRight, FiPlusCircle, FiEye, FiMessageSquare, FiCalendar, 
         FiUser, FiTag, FiBarChart2, FiTrendingUp, FiEdit, FiZap, FiBox,
         FiPieChart, FiMonitor, FiShield, FiTool, FiUsers, FiBook } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, 
         LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

export default function EmployeeDashboard({ user, profile }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    if (user) {
      const userId = user.id || user.userId;
      if (userId) {
        fetchEmployeeTickets(userId);
      } else {
        setLoading(false);
        toast.error('User ID not found');
      }
    }
  }, [user]);

  const fetchEmployeeTickets = async (userId) => {
    try {
      console.log('Fetching tickets for employee with ID:', userId);
      setLoading(true);
      
      // Fetch tickets created by this employee using centralized apiService
      // This API is available to all authenticated users for their own tickets
      const { data, error } = await apiService.getMyTickets();
      
      if (error) {
        if (error.statusCode === 403) {
          toast.error('You do not have permission to view these tickets');
          setTickets([]);
          return;
        }
        throw error;
      }
      
      const ticketsData = Array.isArray(data) ? data : [];
      setTickets(ticketsData);
      
      // Calculate statistics
      const total = ticketsData.length || 0;
      const open = ticketsData.filter(ticket => ticket.status?.toLowerCase() === 'open').length || 0;
      const inProgress = ticketsData.filter(ticket => ticket.status?.toLowerCase() === 'in progress').length || 0;
      const resolved = ticketsData.filter(ticket => ticket.status?.toLowerCase() === 'resolved').length || 0;
      
      setStats({
        total,
        open,
        inProgress,
        resolved
      });
      
    } catch (error) {
      console.error('Error fetching employee tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <FiAlertCircle className="w-4 h-4 text-red-600" />;
      case 'in progress':
        return <FiClock className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <FiCheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <FiActivity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityIconBackground = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-red-100';
      case 'in progress':
        return 'bg-blue-100';
      case 'resolved':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="animate-pulse h-8 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg w-1/4"></div>
          <div className="animate-pulse h-10 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg w-32"></div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="h-28 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden"
            >
              <div className="h-full p-6 flex justify-between">
                <div className="w-2/3">
                  <div className="animate-pulse h-4 bg-blue-100 rounded w-1/2 mb-3"></div>
                  <div className="animate-pulse h-6 bg-blue-200 rounded w-1/3"></div>
                </div>
                <div className="animate-pulse h-10 w-10 bg-blue-100 rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Table Skeleton */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden"
        >
          <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-gray-50 to-white">
            <div className="animate-pulse h-6 bg-indigo-100 rounded w-1/6"></div>
          </div>
          <div className="p-4">
            <div className="animate-pulse h-12 bg-gray-50 rounded-lg mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg mb-3"></div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Dashboard</h1>
          <p className="text-navy-600">Welcome back, {profile?.name || user?.email || 'User'}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/tickets/new" 
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 shadow-sm transition-all duration-200"
            >
              <FiPlusCircle className="w-5 h-5 mr-2" />
              Create New Ticket
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/self-help" 
              className="inline-flex items-center px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 shadow-sm transition-all duration-200"
            >
              <FiMessageSquare className="w-5 h-5 mr-2" />
              Self-Help Resources
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/knowledge-base" 
              className="inline-flex items-center px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 shadow-sm transition-all duration-200"
            >
              <FiBook className="w-5 h-5 mr-2" />
              Knowledge Base
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Tickets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-navy-600 mb-1">Total Tickets</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
              {stats.total > 0 && (
                <p className="text-xs text-navy-500 mt-1">All your support requests</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-full shadow-sm">
              <FiTag className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center text-xs text-navy-600">
                <FiBarChart2 className="w-4 h-4 mr-1 text-blue-500" />
                <span>Lifetime tickets</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Open Tickets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-navy-600 mb-1">Open Tickets</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.open}</p>
              {stats.total > 0 && (
                <p className="text-xs text-navy-500 mt-1">{Math.round((stats.open / stats.total) * 100)}% of total</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-full shadow-sm">
              <FiClock className="w-6 h-6 text-green-500" />
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-4 pt-2">
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.round((stats.open / stats.total) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* In Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-sm p-6 border border-indigo-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-navy-600 mb-1">In Progress</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.inProgress}</p>
              {stats.total > 0 && (
                <p className="text-xs text-navy-500 mt-1">{Math.round((stats.inProgress / stats.total) * 100)}% of total</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-full shadow-sm">
              <FiActivity className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-4 pt-2">
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full" 
                  style={{ width: `${Math.round((stats.inProgress / stats.total) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Resolved */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-navy-600 mb-1">Resolved</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.resolved}</p>
              {stats.total > 0 && (
                <p className="text-xs text-navy-500 mt-1">{Math.round((stats.resolved / stats.total) * 100)}% of total</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-full shadow-sm">
              <FiCheckCircle className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-4 pt-2">
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.round((stats.resolved / stats.total) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Ticket Distribution Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
      >
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden">
          <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
            <div className="flex items-center">
              <FiPieChart className="w-5 h-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-bold text-navy-900">Ticket Status Distribution</h2>
            </div>
          </div>
          <div className="p-6 flex flex-col items-center justify-center">
            {loading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiRefreshCw className="w-8 h-8 text-indigo-400" />
                </motion.div>
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="w-48 h-48">
                  <Doughnut 
                    data={{
                      labels: ['Open', 'In Progress', 'Resolved'],
                      datasets: [
                        {
                          data: [stats.open, stats.inProgress, stats.resolved],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',   // Open - red
                            'rgba(59, 130, 246, 0.7)',  // In Progress - blue
                            'rgba(16, 185, 129, 0.7)',  // Resolved - green
                          ],
                          borderColor: [
                            'rgba(239, 68, 68, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(16, 185, 129, 1)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            font: {
                              size: 12,
                            },
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      cutout: '70%',
                    }}
                  />
                </div>
              </div>
            )}
            <div className="w-full grid grid-cols-3 gap-2 mt-4">
              <div className="flex flex-col items-center p-2 rounded-lg bg-red-50">
                <span className="text-xs text-gray-500">Open</span>
                <span className="text-lg font-semibold text-red-600">{stats.open}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
                <span className="text-xs text-gray-500">In Progress</span>
                <span className="text-lg font-semibold text-blue-600">{stats.inProgress}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-green-50">
                <span className="text-xs text-gray-500">Resolved</span>
                <span className="text-lg font-semibold text-green-600">{stats.resolved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden">
          <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
            <div className="flex items-center">
              <FiActivity className="w-5 h-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-bold text-navy-900">Recent Activity</h2>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-start"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Array.isArray(tickets) && tickets.slice(0, 5).map((ticket, index) => (
                  <motion.div 
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getActivityIconBackground(ticket.status)}`}>
                      {getActivityIcon(ticket.status)}
                    </div>
                    <div>
                      <Link to={`/tickets/${ticket.id}`} className="font-medium text-navy-900 hover:text-indigo-600 transition-colors">
                        {ticket.title}
                      </Link>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* My Tickets */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden"
      >
        <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
          <div className="flex items-center">
            <FiTag className="w-5 h-5 text-indigo-500 mr-2" />
            <h2 className="text-lg font-bold text-navy-900">My Tickets</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
              {tickets.length} total
            </span>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-indigo-50 transition-colors"
              onClick={() => {
                if (user) {
                  const userId = user.id || user.userId;
                  if (userId) fetchEmployeeTickets(userId);
                }
              }}
            >
              <FiRefreshCw className="w-4 h-4 text-indigo-500" />
            </motion.button>
          </div>
        </div>
        
        {tickets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-12 text-center"
          >
            <div className="bg-indigo-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FiTag className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-lg font-medium text-navy-800 mb-2">No Tickets Yet</h3>
            <p className="text-navy-600 mb-6 max-w-md mx-auto">You haven't created any support tickets yet. Create your first ticket to get help from our support team.</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link 
                to="/tickets/new" 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 shadow-sm transition-all duration-200"
              >
                <FiPlusCircle className="w-5 h-5 mr-2" />
                Create Your First Ticket
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <div className="p-4 flex items-center justify-between border-b border-indigo-50">
              <div className="relative w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search tickets..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Filter by:</span>
                <select className="border border-gray-200 rounded-lg text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {Array.isArray(tickets) && tickets
                  .filter(ticket => 
                    searchQuery === '' || 
                    ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ticket.id?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((ticket, index) => (
                  <motion.tr 
                    key={ticket.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-indigo-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-900">#{ticket.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">{ticket.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">
                      {ticket.assignedToName ? (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                            <FiUser className="h-3 w-3 text-indigo-600" />
                          </div>
                          <span>{ticket.assignedToName}</span>
                        </div>
                      ) : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">
                      <div className="flex items-center">
                        <FiCalendar className="h-3 w-3 text-gray-400 mr-1" />
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/tickets/${ticket.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                          <FiEye className="w-4 h-4 mr-1" /> View
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {tickets.length > 0 && tickets.filter(ticket => 
              searchQuery === '' || 
              ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              ticket.id?.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">No tickets match your search criteria</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* AI Suggestions Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden"
      >
        <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center">
            <FiZap className="w-5 h-5 text-indigo-500 mr-2" />
            <h2 className="text-lg font-bold text-navy-900">AI Suggestions</h2>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FiMonitor className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">New</span>
            </div>
            <h3 className="font-medium text-navy-700 mb-2">IT Equipment Request</h3>
            <p className="text-navy-600 text-sm mb-3 h-16">
              Need new equipment? Submit a request through our streamlined process.
            </p>
            <button className="text-sm flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
              Create Request
              <FiArrowRight className="ml-1 w-3 h-3" />
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FiShield className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Recommended</span>
            </div>
            <h3 className="font-medium text-navy-700 mb-2">Security Training</h3>
            <p className="text-navy-600 text-sm mb-3 h-16">
              Complete your quarterly security awareness training by the end of this month.
            </p>
            <button className="text-sm flex items-center text-purple-600 hover:text-purple-800 transition-colors">
              Start Training
              <FiArrowRight className="ml-1 w-3 h-3" />
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FiTool className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Self-Help</span>
            </div>
            <h3 className="font-medium text-navy-700 mb-2">Troubleshooting Guide</h3>
            <p className="text-navy-600 text-sm mb-3 h-16">
              Access our new troubleshooting guides for common workplace IT issues.
            </p>
            <button className="text-sm flex items-center text-green-600 hover:text-green-800 transition-colors">
              View Guides
              <FiArrowRight className="ml-1 w-3 h-3" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
