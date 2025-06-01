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

export default function SupportDashboard({ user, profile }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState(['IT', 'HR', 'ADMIN']);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSupportTickets();
    }
  }, [user, selectedDepartment]);

  const fetchSupportTickets = async () => {
    try {
      console.log('Fetching tickets for support staff');
      setLoading(true);
      
      // Get the department from the profile if available
      const userDepartment = profile?.department || 'IT';
      
      // Use the appropriate API based on department selection
      let { data, error } = selectedDepartment !== 'all' ?
        // Get tickets by category (SUPPORT role required)
        await apiService.getTicketsByCategory(selectedDepartment) :
        // Get tickets by category using user's department (SUPPORT role required)
        await apiService.getTicketsByCategory(userDepartment);
      
      if (error) {
        if (error.statusCode === 403) {
          toast.error('You do not have permission to view these tickets');
          setTickets([]);
          return;
        }
        throw error;
      }
      
      // Sort by priority and created date
      if (Array.isArray(data)) {
        data.sort((a, b) => {
          // Sort by priority (high to low)
          const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
          const priorityDiff = (priorityOrder[a.priority?.toLowerCase()] || 999) - 
                              (priorityOrder[b.priority?.toLowerCase()] || 999);
          
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by created date (newest first)
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
      }
      
      setTickets(Array.isArray(data) ? data : []);
      
      // Calculate statistics
      const ticketsData = Array.isArray(data) ? data : [];
      const total = ticketsData.length || 0;
      const open = ticketsData.filter(ticket => ticket.status?.toLowerCase() === 'open').length || 0;
      const inProgress = ticketsData.filter(ticket => ticket.status?.toLowerCase() === 'in progress').length || 0;
      const resolved = ticketsData.filter(ticket => ticket.status?.toLowerCase() === 'resolved').length || 0;
      const highPriority = ticketsData.filter(ticket => ticket.priority?.toLowerCase() === 'high').length || 0;
      
      setStats({
        total,
        open,
        inProgress,
        resolved,
        highPriority
      });
      
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 bg-gradient-to-r from-indigo-200 to-blue-100 rounded-full w-1/4 mb-6"
        ></motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
              className="h-32 bg-gradient-to-r from-indigo-100 to-white rounded-xl shadow-sm"
            ></motion.div>
          ))}
        </div>
        
        <div className="mb-6">
          <motion.div 
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="h-14 border-b border-indigo-50 px-6 bg-indigo-50/30"></div>
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: [0.6, 0.8, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                  className="h-12 bg-indigo-50 rounded-lg"
                ></motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="h-14 border-b border-indigo-50 px-6 bg-indigo-50/30"></div>
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                className="h-24 bg-indigo-50 rounded-lg"
              ></motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Department Filter */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="font-medium text-navy-700">Department:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment('all')}
            className={`px-3 py-1 rounded-md ${
              selectedDepartment === 'all' 
                ? 'bg-navy-600 text-white' 
                : 'bg-beige-100 text-navy-700 hover:bg-beige-200'
            }`}
          >
            All
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1 rounded-md ${
                selectedDepartment === dept 
                  ? 'bg-navy-600 text-white' 
                  : 'bg-beige-100 text-navy-700 hover:bg-beige-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <p className="text-xs text-navy-500 mt-1">Across all departments</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FiBox className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200">
            <button 
              onClick={() => fetchSupportTickets()}
              className="text-xs flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FiRefreshCw className="w-3 h-3 mr-1" />
              Refresh Data
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-navy-600 mb-1">Open</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.open}</p>
              {stats.total > 0 && (
                <p className="text-xs text-navy-500 mt-1">{Math.round((stats.open / stats.total) * 100)}% of total</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FiAlertCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${stats.total ? (stats.open / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm p-6 border border-indigo-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-navy-600 mb-1">In Progress</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.inProgress}</p>
              {stats.total > 0 && (
                <p className="text-xs text-navy-500 mt-1">{Math.round((stats.inProgress / stats.total) * 100)}% of total</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FiActivity className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full" 
              style={{ width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </motion.div>

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
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FiCheckCircle className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full" 
              style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-gradient-to-br from-coral-50 to-coral-100 rounded-xl shadow-sm p-6 border border-coral-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-navy-600 mb-1">High Priority</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.highPriority}</p>
              {stats.total > 0 && (
                <p className="text-xs text-navy-500 mt-1">{Math.round((stats.highPriority / stats.total) * 100)}% of total</p>
              )}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FiZap className="w-6 h-6 text-coral-500" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-coral-500 rounded-full" 
              style={{ width: `${stats.total ? (stats.highPriority / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* Ticket Queue */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden mb-8"
      >
        <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
          <div className="flex items-center">
            <FiMessageSquare className="w-5 h-5 text-indigo-500 mr-2" />
            <h2 className="text-lg font-bold text-navy-900">Ticket Queue</h2>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
              {tickets.length} tickets
            </span>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative mr-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all duration-200"
              />
            </div>
            
            <button
              onClick={() => fetchSupportTickets()}
              className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors text-sm"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <Link 
              to="/knowledge-base" 
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
            >
              <FiBook className="w-3.5 h-3.5 mr-1" />
              Knowledge Base
            </Link>
          </div>
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FiInbox className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-800 mb-1">No tickets found</h3>
              <p className="text-navy-600 mb-6">There are no tickets assigned to this department yet.</p>
              <button
                onClick={() => fetchSupportTickets()}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Refresh Tickets
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {Array.isArray(tickets) && tickets.map((ticket) => (
                  <motion.tr 
                    key={ticket.id} 
                    className="hover:bg-indigo-50 transition-colors duration-150"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">#{ticket.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-700">{ticket.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">
                      {ticket.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center">
                        <FiEye className="w-3.5 h-3.5 mr-1" /> View
                      </Link>
                      <Link to={`/tickets/${ticket.id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                        <FiEdit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* AI Suggestions Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden"
      >
        <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
          <div className="flex items-center">
            <FiZap className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-bold text-navy-900">AI Insights</h2>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            3 new insights
          </span>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FiPieChart className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">New</span>
            </div>
            <h3 className="font-medium text-navy-700 mb-2">Pattern Detection</h3>
            <p className="text-navy-600 text-sm mb-3 h-16">
              30% increase in VPN connectivity issues in the last 24 hours.
            </p>
            <button className="text-sm flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
              View Affected Tickets
              <FiArrowRight className="ml-1 w-3 h-3" />
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FiBook className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Suggested</span>
            </div>
            <h3 className="font-medium text-navy-700 mb-2">Knowledge Base</h3>
            <p className="text-navy-600 text-sm mb-3 h-16">
              Consider adding a new article about email migration issues.
            </p>
            <button className="text-sm flex items-center text-green-600 hover:text-green-800 transition-colors">
              Create Article
              <FiArrowRight className="ml-1 w-3 h-3" />
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FiMessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">5 New</span>
            </div>
            <h3 className="font-medium text-navy-700 mb-2">Response Templates</h3>
            <p className="text-navy-600 text-sm mb-3 h-16">
              AI-generated response templates for common support issues.
            </p>
            <button className="text-sm flex items-center text-amber-600 hover:text-amber-800 transition-colors">
              Review Templates
              <FiArrowRight className="ml-1 w-3 h-3" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
