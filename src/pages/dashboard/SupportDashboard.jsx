import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticketService';
import profileService from '../../services/profileService';

export default function SupportDashboard({ user, profile }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState(['IT', 'HR', 'ADMIN']);

  useEffect(() => {
    if (user) {
      fetchSupportTickets();
    }
  }, [user, selectedDepartment]);

  const fetchSupportTickets = async () => {
    try {
      console.log('Fetching tickets for support staff');
      
      // Get the department from the profile if available
      const userDepartment = profile?.department || 'IT';
      
      // Get all tickets first
      let { data } = await ticketService.getAllTickets();
      
      // Filter by department if needed
      if (selectedDepartment !== 'all' && Array.isArray(data)) {
        data = data.filter(ticket => ticket.category === selectedDepartment);
      } else if (Array.isArray(data)) {
        // If the user has a department, only show tickets for that department
        data = data.filter(ticket => ticket.category === userDepartment);
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
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
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

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-beige-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-beige-100 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-beige-100 rounded-lg"></div>
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
        <div className="bg-white rounded-lg shadow-soft p-6 border border-beige-100">
          <div className="flex items-center">
            <div className="bg-beige-100 p-3 rounded-md">
              <svg className="w-6 h-6 text-beige-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-navy-600">Total Tickets</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-beige-100">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-md">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-navy-600">Open Tickets</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-beige-100">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-md">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-navy-600">In Progress</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-beige-100">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-md">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-navy-600">Resolved</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-beige-100">
          <div className="flex items-center">
            <div className="bg-coral-100 p-3 rounded-md">
              <svg className="w-6 h-6 text-coral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-navy-600">High Priority</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Queue */}
      <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-beige-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-navy-900">Ticket Queue</h2>
          <Link 
            to="/knowledge-base" 
            className="inline-flex items-center px-3 py-1 bg-beige-100 text-navy-700 rounded-md hover:bg-beige-200 transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Knowledge Base
          </Link>
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="w-12 h-12 text-beige-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-navy-600">No tickets found for the selected department.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100">
                {Array.isArray(tickets) && tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-beige-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-900">#{ticket.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">{ticket.title}</td>
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
                      {ticket.createdByName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">
                      {ticket.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/tickets/${ticket.id}`} className="text-beige-600 hover:text-beige-900 mr-3">View</Link>
                      <Link to={`/tickets/${ticket.id}/edit`} className="text-navy-600 hover:text-navy-900">Respond</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Suggestions Panel */}
      <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
        <div className="p-6 border-b border-beige-100">
          <h2 className="text-lg font-bold text-navy-900">AI Suggestions</h2>
        </div>
        <div className="p-6">
          <div className="bg-beige-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-navy-700 mb-2">Pattern Detection</h3>
            <p className="text-navy-600 text-sm mb-3">
              There has been a 30% increase in IT tickets related to VPN connectivity issues in the last 24 hours.
            </p>
            <button className="text-sm text-beige-600 hover:text-beige-800">
              View Affected Tickets
            </button>
          </div>
          
          <div className="bg-beige-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-navy-700 mb-2">Knowledge Base Suggestion</h3>
            <p className="text-navy-600 text-sm mb-3">
              Consider adding a new knowledge base article about the recent email migration issues.
            </p>
            <button className="text-sm text-beige-600 hover:text-beige-800">
              Create Article
            </button>
          </div>
          
          <div className="bg-beige-50 rounded-lg p-4">
            <h3 className="font-medium text-navy-700 mb-2">Response Templates</h3>
            <p className="text-navy-600 text-sm mb-3">
              You have 5 new AI-generated response templates for common issues.
            </p>
            <button className="text-sm text-beige-600 hover:text-beige-800">
              Review Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
