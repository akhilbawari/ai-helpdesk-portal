import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticketService';

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
      
      // Fetch tickets created by this employee
      const { data } = await ticketService.getTicketsByCreatedBy(userId);
      
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-beige-100 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-beige-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link 
          to="/tickets/new" 
          className="inline-flex items-center px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Ticket
        </Link>
        <Link 
          to="/self-help" 
          className="inline-flex items-center px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Self-Help Bot
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
      </div>

      {/* My Tickets */}
      <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
        <div className="p-6 border-b border-beige-100">
          <h2 className="text-lg font-bold text-navy-900">My Tickets</h2>
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="w-12 h-12 text-beige-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-navy-600">You haven't created any tickets yet.</p>
            <Link to="/tickets/new" className="mt-4 inline-flex items-center px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 transition-colors">
              Create Your First Ticket
            </Link>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-600 uppercase tracking-wider">Assigned To</th>
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
                      {ticket.assignedToName || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/tickets/${ticket.id}`} className="text-beige-600 hover:text-beige-900">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
