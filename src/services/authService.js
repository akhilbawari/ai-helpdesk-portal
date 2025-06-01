import apiClient from '../utils/apiClient';
import { handleApiError } from '../utils/errorHandler';

// Get environment variables
const AUTH_TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || 'auth_token';

const authService = {
  // Register a new user
  register: async (registerData) => {
    try {
      console.log('🔍 Attempting to register with data:', registerData);
      const response = await apiClient.post('/auth/register', registerData);
      console.log('✅ Register API response:', response.data);
      
      // Store the original ApiResponse for status and message access
      const originalData = response.originalData || {};
      
      if (response.data.token) {
        localStorage.setItem(AUTH_TOKEN_NAME, response.data.token);
      }
      return { data: response.data, error: null, originalData };
    } catch (error) {
      console.error('❌ Register API error:', error.response || error);
      const errorMessage = handleApiError(error, 'Registration');
      return { data: null, error: errorMessage };
    }
  },

  // Login with email and password
  login: async (email, password) => {
    try {
      console.log('🔍 Attempting to login with:', { email });
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('✅ Login API response:', response.data);
      console.log('✅ Original API response:', response.originalData);
      
      // Store the original ApiResponse for status and message access
      const originalData = response.originalData || {};
      console.log('✅ Token present:', !!response.data?.token);
      console.log('✅ User present:', !!response.data?.user);
      
      if (response.data?.token) {
        localStorage.setItem(AUTH_TOKEN_NAME, response.data.token);
        console.log('✅ Token stored in localStorage');
      }
      return { data: response.data, error: null, originalData };
    } catch (error) {
      console.error('❌ Login API error:', error.response || error);
      const errorMessage = handleApiError(error, 'Login');
      return { data: null, error: errorMessage };
    }
  },
  
  // Login with Google OAuth
  loginWithGoogle: async () => {
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `${apiClient.defaults.baseURL}/oauth/google`;
      return { data: null, error: null }; // This won't actually return as page redirects
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Logout the current user
  logout: async () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_NAME);
      const originalData = { success: true, message: 'Logged out successfully' };
      return { error: null, originalData };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { error: error.message };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem(AUTH_TOKEN_NAME) !== null;
  },

  // Get the current auth token
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_NAME);
  }
};

export default authService;
