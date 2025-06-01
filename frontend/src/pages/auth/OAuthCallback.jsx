import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services';

// Get environment variables
const AUTH_TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || 'auth_token';

export default function OAuthCallback() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setProfile } = useAuth();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Parse the URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorMsg = params.get('error');

        if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store the token
        localStorage.setItem(AUTH_TOKEN_NAME, token);

        // Get user profile
        const { data, error } = await profileService.getCurrentProfile();
        if (error) throw error;

        // Update auth context
        setUser({ id: data.id, email: data.email });
        setProfile(data);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Failed to authenticate. Please try again.');
        localStorage.removeItem(AUTH_TOKEN_NAME);
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    processOAuthCallback();
  }, [location, navigate, setUser, setProfile]);

  return (
    <div className="min-h-screen bg-beige-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <svg className="w-12 h-12 text-beige-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.7274 20.4471C19.2716 19.1713 18.2672 18.0439 16.8701 17.2399C15.4729 16.4358 13.7611 16 12 16C10.2389 16 8.52706 16.4358 7.12991 17.2399C5.73276 18.0439 4.72839 19.1713 4.27259 20.4471" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-bold text-navy-900">
          {loading ? 'Processing Authentication' : error ? 'Authentication Error' : 'Authentication Successful'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-soft sm:rounded-lg sm:px-10 border border-beige-100">
          {loading && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beige-600"></div>
              <p className="mt-4 text-navy-700">Completing authentication...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-coral-50 border-l-4 border-coral-500 p-4 text-coral-700">
              <p>{error}</p>
              <p className="mt-2 text-sm">Redirecting to login page...</p>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col items-center">
              <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-navy-700">Authentication successful! Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
