import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticketService';
import profileService from '../../services/profileService';
import aiService from '../../services/aiService';

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
      
      // Fetch all tickets
      const { data: ticketsData, error: ticketsError } = await ticketService.getAllTickets();
      
      if (ticketsError) throw ticketsError;
      
      // Fetch all profiles
      const { data: usersData, error: usersError } = await profileService.getAllProfiles();
      
      if (usersError) throw usersError;
      
      // Fetch recent tickets (we'll get all and take the first 5)
      const { data: allTickets } = await ticketService.getAllTickets();
      const recentTicketsData = allTickets ? allTickets.slice(0, 5) : [];
      
      // Fetch recent users (we'll get all and take the first 5)
      const { data: allUsers } = await profileService.getAllProfiles();
      const recentUsersData = allUsers ? allUsers.slice(0, 5) : [];
      
      // Calculate statistics
      const totalTickets = ticketsData?.length || 0;
      const openTickets = ticketsData?.filter(ticket => ticket.status.toLowerCase() === 'open').length || 0;
      const totalUsers = usersData?.length || 0;
      
      // Calculate department statistics based on the department of the ticket creator
      const departments = {
        IT: ticketsData?.filter(ticket => {
          const creatorProfile = usersData?.find(user => user.id === ticket.createdBy);
          return creatorProfile?.department === 'IT';
        }).length || 0,
        HR: ticketsData?.filter(ticket => {
          const creatorProfile = usersData?.find(user => user.id === ticket.createdBy);
          return creatorProfile?.department === 'HR';
        }).length || 0,
        ADMIN: ticketsData?.filter(ticket => {
          const creatorProfile = usersData?.find(user => user.id === ticket.createdBy);
          return creatorProfile?.department === 'ADMIN';
        }).length || 0
      };
      
      setStats({
        totalTickets,
        openTickets,
        totalUsers,
        departments
      });
      
      // Get AI pattern detection
      const { data: patternData } = await aiService.detectPatterns(ticketsData);
      if (patternData && Array.isArray(patternData)) {
        setPatternAlerts(patternData);
      } else {
        // If no pattern data or it's not an array, set an empty array
        setPatternAlerts([]);
      }
      
      setRecentTickets(recentTicketsData || []);
      setRecentUsers(recentUsersData || []);
      
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-beige-100 rounded-lg"></div>
          <div className="h-64 bg-beige-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* System Overview */}
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
              <p className="text-2xl font-bold text-navy-900">{stats.totalTickets}</p>
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
              <p className="text-2xl font-bold text-navy-900">{stats.openTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-beige-100">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-md">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-navy-600">Total Users</h3>
              <p className="text-2xl font-bold text-navy-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-beige-100">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-md">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-navy-600">AI Suggestions</h3>
              <p className="text-2xl font-bold text-navy-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link 
          to="/admin/users" 
          className="inline-flex items-center px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Manage Users
        </Link>
        <Link 
          to="/admin/knowledge-base" 
          className="inline-flex items-center px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Knowledge Base
        </Link>
        <Link 
          to="/admin/settings" 
          className="inline-flex items-center px-4 py-2 bg-beige-100 text-navy-700 rounded-md hover:bg-beige-200 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          System Settings
        </Link>
      </div>

      {/* Department Performance & Pattern Detection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
          <div className="p-6 border-b border-beige-100">
            <h2 className="text-lg font-bold text-navy-900">Department Performance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-navy-700">IT Department</span>
                  <span className="text-navy-700 font-medium">{stats.departments.IT} tickets</span>
                </div>
                <div className="w-full bg-beige-100 rounded-full h-2.5">
                  <div className="bg-beige-600 h-2.5 rounded-full" style={{ width: `${(stats.departments.IT / stats.totalTickets) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-navy-700">HR Department</span>
                  <span className="text-navy-700 font-medium">{stats.departments.HR} tickets</span>
                </div>
                <div className="w-full bg-beige-100 rounded-full h-2.5">
                  <div className="bg-navy-600 h-2.5 rounded-full" style={{ width: `${(stats.departments.HR / stats.totalTickets) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-navy-700">Admin Department</span>
                  <span className="text-navy-700 font-medium">{stats.departments.ADMIN} tickets</span>
                </div>
                <div className="w-full bg-beige-100 rounded-full h-2.5">
                  <div className="bg-coral-600 h-2.5 rounded-full" style={{ width: `${(stats.departments.ADMIN / stats.totalTickets) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link to="/admin/reports" className="text-beige-600 hover:text-beige-800 text-sm font-medium">
                View Detailed Reports →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Pattern Detection Alerts */}
        <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
          <div className="p-6 border-b border-beige-100">
            <h2 className="text-lg font-bold text-navy-900">Pattern Detection Alerts</h2>
          </div>
          <div className="p-6">
            {patternAlerts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-beige-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-navy-600">No pattern alerts detected.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(patternAlerts) && patternAlerts.map((alert) => (
                  <div key={alert.id} className="border border-beige-100 rounded-lg p-4 hover:bg-beige-50">
                    <div className="flex items-start">
                      <div className={`${getSeverityColor(alert.severity)} text-xs font-medium px-2 py-1 rounded-md mt-1`}>
                        {alert.severity}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-navy-900">{alert.title}</h4>
                        <p className="text-sm text-navy-600 mt-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-navy-400 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <Link to="/admin/patterns" className="text-beige-600 hover:text-beige-800 text-sm font-medium">
                View All Patterns →
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
          <div className="p-6 border-b border-beige-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-navy-900">Recent Tickets</h2>
            <Link to="/admin/tickets" className="text-beige-600 hover:text-beige-800 text-sm">
              View All
            </Link>
          </div>
          <div className="p-0">
            {recentTickets.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-navy-600">No recent tickets found.</p>
              </div>
            ) : (
              <div className="divide-y divide-beige-100">
                {Array.isArray(recentTickets) && recentTickets.map((ticket) => (
                  <div key={ticket.id} className="border-b border-beige-100 py-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-navy-900">{ticket.title}</h4>
                        <p className="text-sm text-navy-600 mt-1">
                          Created by {ticket.createdByName || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Link to={`/tickets/${ticket.id}`} className="text-beige-600 hover:text-beige-800 text-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
          <div className="p-6 border-b border-beige-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-navy-900">Recent Users</h2>
            <Link to="/admin/users" className="text-beige-600 hover:text-beige-800 text-sm">
              View All
            </Link>
          </div>
          <div className="p-0">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-navy-600">No recent users found.</p>
              </div>
            ) : (
              <div className="divide-y divide-beige-100">
                {Array.isArray(recentUsers) && recentUsers.map((user) => (
                  <div key={user.id} className="border-b border-beige-100 py-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-navy-900">{user.fullName}</h4>
                        <p className="text-sm text-navy-600 mt-1">
                          {user.department} - {user.role}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Link to={`/admin/users/${user.id}`} className="text-beige-600 hover:text-beige-800 text-sm">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
