import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import profileService from '../../services/profileService';

export default function UserActivityMonitoring() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [filters, setFilters] = useState({
    activityType: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchActivities();
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let response;
      
      if (userId) {
        // Fetch activities for specific user
        response = await adminService.getUserActivities(userId);
      } else {
        // Fetch all activities
        response = await adminService.getAllUserActivities();
      }
      
      setActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      toast.error('Failed to load user activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (id) => {
    try {
      const { data, error } = await profileService.getProfileById(id);
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchActivitiesWithFilters();
  };

  const fetchActivitiesWithFilters = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (filters.activityType) params.append('activityType', filters.activityType);
      if (filters.dateFrom) params.append('from', filters.dateFrom);
      if (filters.dateTo) params.append('to', filters.dateTo);
      
      const response = await adminService.getUserActivitiesWithFilters(params.toString());
      setActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching filtered user activities:', error);
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      activityType: '',
      dateFrom: '',
      dateTo: ''
    });
    fetchActivities();
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-beige-100 text-beige-800';
      case 'TICKET_CREATED':
        return 'bg-blue-100 text-blue-800';
      case 'TICKET_UPDATED':
        return 'bg-purple-100 text-purple-800';
      case 'ROLE_CHANGE':
        return 'bg-orange-100 text-orange-800';
      case 'USER_CREATED':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !activities.length) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-beige-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-beige-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-900">
          {userProfile ? `Activity Log: ${userProfile.fullName || userProfile.email}` : 'User Activity Monitoring'}
        </h1>
        <div className="flex gap-2">
          {userId && (
            <Link to={`/admin/users/${userId}`} className="text-beige-600 hover:text-beige-800">
              View User Profile
            </Link>
          )}
          <Link to="/admin/users" className="text-navy-600 hover:text-navy-800">
            Back to User Management
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-soft border border-beige-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-navy-900 mb-4">Filter Activities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-navy-700 mb-2">Activity Type</label>
            <select
              name="activityType"
              value={filters.activityType}
              onChange={handleFilterChange}
              className="w-full border border-beige-200 rounded-md p-2"
            >
              <option value="">All Types</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="TICKET_CREATED">Ticket Created</option>
              <option value="TICKET_UPDATED">Ticket Updated</option>
              <option value="ROLE_CHANGE">Role Change</option>
              <option value="USER_CREATED">User Created</option>
            </select>
          </div>
          
          <div>
            <label className="block text-navy-700 mb-2">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full border border-beige-200 rounded-md p-2"
            />
          </div>
          
          <div>
            <label className="block text-navy-700 mb-2">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full border border-beige-200 rounded-md p-2"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 transition-colors"
          >
            Apply Filters
          </button>
          
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-beige-100 text-navy-700 rounded-md hover:bg-beige-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
        <div className="p-6 border-b border-beige-100">
          <h2 className="text-lg font-bold text-navy-900">Activity Log ({activities.length})</h2>
        </div>
        
        {activities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-navy-600">No activities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-beige-100">
              <thead className="bg-beige-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Timestamp</th>
                  {!userId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">User</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Activity Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-beige-100">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-beige-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-navy-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </td>
                    
                    {!userId && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/admin/user-activities?userId=${activity.userId}`} className="text-sm text-beige-600 hover:text-beige-800">
                          {activity.userEmail || activity.userId}
                        </Link>
                      </td>
                    )}
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getActivityTypeColor(activity.activityType)}`}>
                        {activity.activityType}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-navy-600">{activity.description}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-navy-600">{activity.ipAddress || 'N/A'}</div>
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
