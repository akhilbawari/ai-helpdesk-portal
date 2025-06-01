import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Unauthorized page displayed when a user attempts to access a route
 * they don't have permission to view.
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine where to send the user back to based on their role
  const goBack = () => {
    if (!user) {
      navigate('/login');
    } else {
      // Default to dashboard, but could be customized based on user role
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-red-500 text-6xl mb-4">403</h1>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator
            if you believe this is an error.
          </p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
