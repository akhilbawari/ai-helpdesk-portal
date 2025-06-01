import axios from 'axios';

// Get environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AUTH_TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || 'auth_token';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't use withCredentials with wildcard CORS policy
});

// Add a request interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to log errors
const logError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  // Here you could add integration with error monitoring services
};

// Function to transform backend response to expected frontend format
const transformAuthResponse = (data) => {
  console.log('🔄 Transforming auth response, original data:', data);
  
  // If the data already has a user property, return it as is
  if (data && data.user) {
    console.log('✅ Data already has user property, returning as is');
    return data;
  }
  
  // Otherwise, create a user object from the auth response
  if (data && (data.userId || data.email)) {
    const transformedData = {
      token: data.token,
      user: {
        id: data.userId,
        email: data.email,
        role: data.role
      }
    };
    console.log('✅ Created user object from auth response:', transformedData);
    
    // Store user data in localStorage for session persistence
    if (transformedData.user) {
      console.log('💾 Storing user data in localStorage from apiClient');
      localStorage.setItem('user_data', JSON.stringify(transformedData.user));
    }
    
    return transformedData;
  }
  
  console.log('⚠️ Could not transform auth response, returning original data');
  return data;
};

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('🔍 Raw API response:', response.data);
    
    // Unwrap the data from ApiResponse if it's in that format
    if (response.data && response.data.hasOwnProperty('success')) {
      // Store the original response for status code and message access
      response.originalData = { ...response.data };
      
      // If the backend response is in ApiResponse format
      if (!response.data.success) {
        // If the API response indicates failure
        const apiError = new Error(response.data.message || 'API request failed');
        apiError.response = response;
        apiError.apiError = response.data;
        apiError.statusCode = response.data.statusCode;
        return Promise.reject(apiError);
      }
      
      // If successful, return the data property directly
      response.data = response.data.data;
      
      // For auth endpoints, transform the response to expected format
      if (response.config.url.includes('/auth/login') || response.config.url.includes('/auth/register')) {
        console.log('🔄 Transforming auth response');
        response.data = transformAuthResponse(response.data);
        console.log('✅ Transformed response:', response.data);
      }
    }
    return response;
  },
  (error) => {
    // Log the error for debugging
    logError(error, 'API Request');
    
    // Handle specific HTTP status codes
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized errors (token expired, etc.)
      if (status === 401) {
        // Clear local storage and redirect to login
        localStorage.removeItem(AUTH_TOKEN_NAME);
        window.location.href = '/login?session=expired';
      }
      
      // Add status code to error object for better error handling
      error.statusCode = status;
      
      // If the error contains an ApiResponse format, extract the message
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
