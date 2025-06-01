import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import SupportDashboard from './SupportDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('Dashboard: User data available:', user);
    // Use either user.id or user.userId based on what's available
    const userId = user.id || user.userId;
    
    if (userId) {
      console.log('Fetching tickets for user ID:', userId);
      fetchTickets(userId);
    } else {
      console.warn('No user ID available for fetching tickets');
      setLoading(false);
    }
  }, [user, navigate]);



  const fetchTickets = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, assigned_to(full_name), created_by(full_name)')
        .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beige-600"></div>
      </div>
    );
  }

  // Determine which dashboard to render based on user role
  const renderRoleBasedDashboard = () => {
    if (!profile) return null;
    
    const role = profile.role ? profile.role.toLowerCase() : 'employee';
    
    console.log('Rendering dashboard for role:', role);
    
    switch (role) {
      case 'admin':
        return <AdminDashboard user={user} profile={profile} />;
      case 'support':
        return <SupportDashboard user={user} profile={profile} />;
      case 'employee':
      default:
        return <EmployeeDashboard user={user} profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="bg-white shadow-sm border-b border-beige-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-navy-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              {profile && (
                <div className="text-right">
                  <p className="text-sm font-medium text-navy-900">{profile.full_name}</p>
                  <p className="text-xs text-navy-600">{profile.department} - {profile.role}</p>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="btn-outline text-sm px-3 py-1"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {renderRoleBasedDashboard()}
      </div>
    </div>
  );
}
