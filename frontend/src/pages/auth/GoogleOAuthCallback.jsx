import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services';
import axios from 'axios';

// Get environment variables
const AUTH_TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || 'auth_token';
const USER_DATA_KEY = 'user_data';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function GoogleOAuthCallback() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setProfile } = useAuth();

  useEffect(() => {
    const processGoogleOAuthCallback = async () => {
      try {
        // Parse the URL parameters
        const params = new URLSearchParams(location.search);
        const errorMsg = params.get('error');
        const code = params.get('code');

        console.log('GoogleOAuthCallback: URL parameters', { error: errorMsg, code: code ? 'exists' : 'null' });

        // Handle error from backend
        if (errorMsg) {
          console.error('GoogleOAuthCallback: Error from backend', errorMsg);
          setError(decodeURIComponent(errorMsg));
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // If we have a code from Google, exchange it with the backend
        if (code) {
          console.log('GoogleOAuthCallback: Received authorization code from Google, exchanging with backend...');
          setLoading(true);
          
          try {
            // Make API call to backend with the code
            const response = await axios.get(`${API_BASE_URL}/oauth/google/callback?code=${code}`);
            console.log('GoogleOAuthCallback: Backend response', response.data);
            
            console.log('GoogleOAuthCallback: Checking response structure', response.data);
            
            // Check for the new API response format with nested data
            if (response.data && response.data.success && response.data.data && response.data.data.token) {
              // Store the token from the nested data structure
              const token = response.data.data.token;
              localStorage.setItem(AUTH_TOKEN_NAME, token);
              console.log('GoogleOAuthCallback: Token stored in localStorage');
              
              // Store user data in localStorage with role information
              const userData = {
                id: response.data.data.userId,
                email: response.data.data.email,
                role: response.data.data.role
              };
              localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
              console.log('GoogleOAuthCallback: User data stored in localStorage', userData);
              
              // Use the profile data directly from the API response
              const profileData = response.data.data;
              console.log('GoogleOAuthCallback: Using profile from API response', { 
                id: profileData.userId, 
                email: profileData.email, 
                role: profileData.role,
                name: profileData.name
              });
              
              // Update auth context with the profile data from the response
              setUser({ id: profileData.userId, email: profileData.email });
              setProfile({
                id: profileData.userId,
                email: profileData.email,
                role: profileData.role,
                name: profileData.name,
                profilePicture: profileData.profilePicture
              });
              console.log('GoogleOAuthCallback: Auth context updated');
              
              // Redirect based on user role
              if (profileData.role === 'ADMIN') {
                console.log('GoogleOAuthCallback: Redirecting to admin dashboard');
                navigate('/admin/dashboard');
              } else {
                console.log('GoogleOAuthCallback: Redirecting to user dashboard');
                navigate('/dashboard');
              }
            } else {
              throw new Error('Invalid response from server');
            }
          } catch (apiError) {
            console.error('GoogleOAuthCallback: API error', apiError);
            setError('Failed to exchange authorization code. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
          } finally {
            setLoading(false);
          }
          
          return;
        }
        
        // If we have neither token nor code nor error
        setError('Invalid callback. Please try logging in again.');
        setTimeout(() => navigate('/login'), 3000);
        
      } catch (err) {
        console.error('Google OAuth callback error:', err);
        setError('Failed to authenticate with Google. Please try again.');
        localStorage.removeItem(AUTH_TOKEN_NAME);
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    processGoogleOAuthCallback();
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
          {loading ? 'Processing Google Authentication' : error ? 'Authentication Error' : 'Authentication Successful'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-soft sm:rounded-lg sm:px-10 border border-beige-100">
          {loading && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beige-600"></div>
              <p className="mt-4 text-navy-700">Completing Google authentication...</p>
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
              <p className="mt-4 text-navy-700">Google authentication successful! Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
