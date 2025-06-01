import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component for routes that require authentication
 * and optionally specific roles for access.
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children The components to render if authorized
 * @param {string[]} [props.allowedRoles] Optional array of roles that can access this route
 * @param {string} [props.redirectPath='/login'] Path to redirect to if unauthorized
 * @returns {React.ReactNode} The protected component or redirect
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectPath = '/login' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If allowedRoles is provided and user's role is not in it, redirect to unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
