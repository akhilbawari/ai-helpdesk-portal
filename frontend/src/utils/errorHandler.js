/**
 * Centralized error handling utility for the frontend application
 */

// Map backend error codes to user-friendly messages
const ERROR_MESSAGES = {
  // HTTP status codes
  400: 'Invalid request. Please check your input and try again.',
  401: 'Authentication failed. Please log in again.',
  403: 'You do not have permission to access this resource.',
  404: 'The requested resource was not found.',
  500: 'An unexpected server error occurred. Please try again later.',
  
  // Custom error codes
  'auth/invalid-credentials': 'Invalid email or password. Please try again.',
  'auth/user-not-found': 'Account not found. Please check your email or register.',
  'auth/email-already-in-use': 'This email is already registered. Please use a different email or log in.',
  'validation/invalid-input': 'Please check your input and try again.',
};

/**
 * Process API error and return user-friendly message
 * @param {Error|Object} error - Error object from API call
 * @returns {String} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // If error is a string, return it directly
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle axios error response
  if (error.response) {
    const { status, data } = error.response;
    
    // If the backend returns an error message, use it
    if (data && data.message) {
      return data.message;
    }
    
    // Otherwise, use the status code to get a generic message
    return ERROR_MESSAGES[status] || `Error: ${status}`;
  }
  
  // Handle network errors
  if (error.request) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Handle other errors
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Log error to console (and potentially to monitoring service)
 * @param {Error|Object} error - Error object
 * @param {String} context - Context where error occurred
 */
export const logError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  // Here you could add integration with error monitoring services
  // like Sentry, LogRocket, etc.
};

/**
 * Handle API error - logs it and returns user-friendly message
 * @param {Error|Object} error - Error from API call
 * @param {String} context - Context where error occurred
 * @returns {String} User-friendly error message
 */
export const handleApiError = (error, context = '') => {
  logError(error, context);
  return getErrorMessage(error);
};

export default {
  getErrorMessage,
  logError,
  handleApiError,
};
