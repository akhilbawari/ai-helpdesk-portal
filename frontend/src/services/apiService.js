import axios from 'axios';
import { TOKEN_KEY, USER_KEY, USER_ROLES } from '../utils/constants';

/**
 * Centralized API handler for the AI Helpdesk Portal
 * Manages all API calls with proper role-based access control
 */
class ApiService {
  constructor() {
    // Base URL for API calls
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor to handle ApiResponse format
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response interceptor received:', response);
        
        // Unwrap the data from ApiResponse if it's in that format
        if (response.data && response.data.hasOwnProperty('success')) {
          // Store the original response for status code and message access
          response.originalData = { ...response.data };
          
          // If the API response indicates failure
          if (!response.data.success) {
            const apiError = new Error(response.data.message || 'API request failed');
            apiError.response = response;
            apiError.apiError = response.data;
            apiError.statusCode = response.data.statusCode;
            return Promise.reject(apiError);
          }
          
          // For ticket endpoints, return the full response structure
          if (response.config && response.config.url && response.config.url.includes('/tickets/')) {
            console.log('Preserving full response structure for ticket endpoint');
            return response.data;
          }
          
          // If successful, return the data property directly for other endpoints
          return response.data.data;
        }
        return response.data;
      },
      (error) => {
        // Handle specific HTTP status codes
        if (error.response) {
          const { status } = error.response;
          
          // Handle 401 Unauthorized errors (token expired, etc.)
          if (status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
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
  }

  /**
   * Get the current user's role
   * @returns {string|null} User role or null if not authenticated
   */
  getUserRole() {
    // Check both storage keys for user role
    let role = null;
    
    // Try user_info first
    const userInfoStr = localStorage.getItem(USER_KEY);
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo.role) {
          role = userInfo.role;
          console.log('Found role in user_info:', role);
        }
      } catch (e) {
        console.error('Error parsing user_info:', e);
      }
    }
    
    // If no role found, try user_data
    if (!role) {
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData.role) {
            role = userData.role;
            console.log('Found role in user_data:', role);
          }
        } catch (e) {
          console.error('Error parsing user_data:', e);
        }
      }
    }
    
    return role;
  }

  /**
   * Check if the current user has the required role
   * @param {string|Array} requiredRole - Required role(s)
   * @returns {boolean} True if user has the required role
   */
  hasRole(requiredRole) {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    // Admin has access to everything
    if (userRole === USER_ROLES.ADMIN) return true;
    
    // Check if user has the required role
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  }

  /**
   * Make an API call with role validation
   * @param {string} method - HTTP method
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {string|Array} requiredRole - Required role(s)
   * @returns {Promise} API response with data and error properties
   */
  async callWithRoleCheck(method, url, data = null, requiredRole = null) {
    // If role check is required and user doesn't have the role
    if (requiredRole && !this.hasRole(requiredRole)) {
      return { data: null, error: { message: 'Unauthorized: Insufficient permissions', statusCode: 403 } };
    }
    
    try {
      let response;
      if (method.toLowerCase() === 'get') {
        response = await this.api.get(url);
      } else if (method.toLowerCase() === 'post') {
        response = await this.api.post(url, data);
      } else if (method.toLowerCase() === 'put') {
        response = await this.api.put(url, data);
      } else if (method.toLowerCase() === 'delete') {
        response = await this.api.delete(url);
      }
      
      // Handle different response formats
      // Some endpoints return the data directly, others wrap it in a response object
      if (response && response.data) {
        // If it's already in our expected format with data property, return it
        return { data: response.data, error: null };
      } else if (response) {
        // If it's just the raw response, wrap it
        return { data: response, error: null };
      }
      
      // Fallback for unexpected response format
      return { data: null, error: { message: 'Invalid response format', statusCode: 500 } };
    } catch (error) {
      console.error(`Error in ${method} ${url}:`, error);
      return { data: null, error: { message: error.message, statusCode: error.statusCode || 500 } };
    }
  }

  // ==================== AUTHENTICATION APIs ====================
  
  /**
   * Register a new user
   * @param {Object} registerData - User registration data
   * @returns {Promise} Registration response
   */
  async register(registerData) {
    try {
      const response = await this.api.post('/auth/register', registerData);
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          role: response.role
        }));
      }
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response
   */
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          role: response.role
        }));
      }
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Login with Google OAuth
   * @returns {Promise} Google OAuth response
   */
  async loginWithGoogle() {
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `${this.baseURL}/oauth/google`;
      return { data: null, error: null }; // This won't actually return as page redirects
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Logout the current user
   * @returns {Promise} Logout response
   */
  async logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ==================== TICKET MANAGEMENT APIs ====================
  
  /**
   * Get all tickets (ADMIN, SUPPORT only)
   * @returns {Promise} List of all tickets
   */
  async getAllTickets() {
    return this.callWithRoleCheck('get', '/tickets', null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get ticket by ID (ADMIN, SUPPORT, or ticket creator)
   * @param {string} id - Ticket ID
   * @returns {Promise} Ticket details
   */
  async getTicketById(id) {
    // Note: Backend handles the authorization check for ticket creator
    try {
      console.log('Fetching ticket with ID:', id);
      const response = await this.api.get(`/tickets/${id}`);
      console.log('Raw API response for ticket:', response);
      
      // Return the complete response to allow the component to handle the structure
      return response;
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      return { 
        success: false, 
        message: error.message || 'Failed to load ticket details', 
        data: null,
        statusCode: error.statusCode || 500
      };
    }
  }

  /**
   * Get tickets created by a user (ADMIN or self)
   * @param {string} userId - User ID
   * @returns {Promise} List of tickets created by the user
   */
  async getTicketsByCreatedBy(userId) {
    // Note: Backend handles the authorization check for self
    return this.callWithRoleCheck('get', `/tickets/created-by/${userId}`);
  }

  /**
   * Get tickets assigned to a user (ADMIN, SUPPORT, or self)
   * @param {string} userId - User ID
   * @returns {Promise} List of tickets assigned to the user
   */
  async getTicketsByAssignedTo(userId) {
    // Note: Backend handles the authorization check for self
    return this.callWithRoleCheck('get', `/tickets/assigned-to/${userId}`);
  }

  /**
   * Get tickets by status (ADMIN, SUPPORT only)
   * @param {string} status - Ticket status
   * @returns {Promise} List of tickets with the specified status
   */
  async getTicketsByStatus(status) {
    return this.callWithRoleCheck('get', `/tickets/status/${status}`, null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get tickets by category (ADMIN, SUPPORT only)
   * @param {string} category - Ticket category/department
   * @returns {Promise} List of tickets in the specified category
   */
  async getTicketsByCategory(category) {
    return this.callWithRoleCheck('get', `/tickets/category/${category}`, null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get tickets by priority (ADMIN, SUPPORT only)
   * @param {string} priority - Ticket priority
   * @returns {Promise} List of tickets with the specified priority
   */
  async getTicketsByPriority(priority) {
    return this.callWithRoleCheck('get', `/tickets/priority/${priority}`, null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get tickets by category and status (ADMIN, SUPPORT only)
   * @param {string} category - Ticket category/department
   * @param {string} status - Ticket status
   * @returns {Promise} List of tickets in the specified category with the specified status
   */
  async getTicketsByCategoryAndStatus(category, status) {
    return this.callWithRoleCheck('get', `/tickets/category/${category}/status/${status}`, null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Create a new ticket (Any authenticated user)
   * @param {Object} ticketData - Ticket data
   * @returns {Promise} Created ticket
   */
  async createTicket(ticketData) {
    return this.callWithRoleCheck('post', '/tickets', ticketData);
  }

  /**
   * Update a ticket (ADMIN, SUPPORT, or ticket creator)
   * @param {string} id - Ticket ID
   * @param {Object} ticketData - Updated ticket data
   * @returns {Promise} Updated ticket
   */
  async updateTicket(id, ticketData) {
    // Note: Backend handles the authorization check for ticket creator
    return this.callWithRoleCheck('put', `/tickets/${id}`, ticketData);
  }

  /**
   * Assign a ticket to a user (ADMIN, SUPPORT only)
   * @param {string} ticketId - Ticket ID
   * @param {string} assigneeId - Assignee user ID
   * @returns {Promise} Updated ticket
   */
  async assignTicket(ticketId, assigneeId) {
    return this.callWithRoleCheck('put', `/tickets/${ticketId}/assign/${assigneeId}`, null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get tickets created by the current user (Any authenticated user)
   * @returns {Promise} List of tickets created by the current user
   */
  async getMyTickets() {
    try {
      // Check both storage keys for user data
      let userId = null;
      let userDataStr = localStorage.getItem('user_data');
      let userInfoStr = localStorage.getItem(USER_KEY);
      
      console.log('Getting tickets - localStorage contents:', {
        user_data: userDataStr,
        user_info: userInfoStr
      });
      
      // Try to get user ID from user_data first (which has the ID)
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData.id;
          console.log('Found user ID in user_data:', userId);
        } catch (e) {
          console.error('Error parsing user_data:', e);
        }
      }
      
      // If no ID found, try user_info
      if (!userId && userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          userId = userInfo.id;
          console.log('Found user ID in user_info:', userId);
        } catch (e) {
          console.error('Error parsing user_info:', e);
        }
      }
      
      if (!userId) {
        console.error('No user ID found in localStorage for getMyTickets');
        return { data: [], error: 'User ID not found' };
      }
      
      console.log('Fetching tickets for user ID:', userId);
      const response = await this.api.get(`/tickets/created-by/${userId}`);
      return { data: response, error: null };
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return { data: [], error: error.message || error };
    }
  }

  /**
   * Delete a ticket (ADMIN only)
   * @param {string} id - Ticket ID
   * @returns {Promise} Deletion response
   */
  async deleteTicket(id) {
    return this.callWithRoleCheck('delete', `/tickets/${id}`, null, USER_ROLES.ADMIN);
  }

  // ==================== ADMIN APIs ====================
  
  /**
   * Get all users (ADMIN only)
   * @returns {Promise} List of all users
   */
  async getAllUsers() {
    return this.callWithRoleCheck('get', '/admin/users', null, USER_ROLES.ADMIN);
  }

  /**
   * Update a user's role (ADMIN only)
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise} Updated user
   */
  async updateUserRole(userId, role) {
    return this.callWithRoleCheck('put', `/admin/users/${userId}/role`, { role }, USER_ROLES.ADMIN);
  }

  /**
   * Bulk import users (ADMIN only)
   * @param {Array} users - List of user data
   * @returns {Promise} Import response
   */
  async bulkImportUsers(users) {
    return this.callWithRoleCheck('post', '/admin/users/bulk-import', { users }, USER_ROLES.ADMIN);
  }

  /**
   * Get user activities (ADMIN only)
   * @param {Object} filters - Optional filters (userId, activityType, from, to)
   * @returns {Promise} List of user activities
   */
  async getUserActivities(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.activityType) queryParams.append('activityType', filters.activityType);
    if (filters.from) queryParams.append('from', filters.from);
    if (filters.to) queryParams.append('to', filters.to);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/user-activities?${queryString}` : '/admin/user-activities';
    
    return this.callWithRoleCheck('get', url, null, USER_ROLES.ADMIN);
  }

  // ==================== AI SERVICE APIs ====================
  
  /**
   * Route a ticket to the appropriate department using AI (Public access)
   * @param {string} title - Ticket title
   * @param {string} description - Ticket description
   * @returns {Promise} Ticket routing suggestions
   */
  async routeTicket(title, description) {
    try {
      const response = await this.api.post('/ai/route-ticket', { title, description });
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get AI-generated response suggestions for a ticket (ADMIN, SUPPORT only)
   * @param {string} ticketTitle - Ticket title
   * @param {string} ticketDescription - Ticket description
   * @param {Array} previousResponses - Previous responses
   * @returns {Promise} Response suggestions
   */
  async suggestResponse(ticketTitle, ticketDescription, previousResponses = []) {
    return this.callWithRoleCheck(
      'post',
      '/ai/suggest-response',
      { ticketTitle, ticketDescription, previousResponses },
      [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]
    );
  }

  /**
   * Detect patterns in recent tickets (ADMIN only)
   * @param {Array} recentTickets - Recent ticket descriptions
   * @returns {Promise} Detected patterns
   */
  async detectPatterns(recentTickets) {
    return this.callWithRoleCheck('post', '/ai/detect-patterns', { recentTickets }, USER_ROLES.ADMIN);
  }

  // ==================== DASHBOARD APIs ====================
  
  /**
   * Get dashboard overview metrics (ADMIN, SUPPORT only)
   * @returns {Promise} Dashboard overview metrics
   */
  async getDashboardOverview() {
    return this.callWithRoleCheck('get', '/dashboard/overview', null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get recent ticket activity (ADMIN, SUPPORT only)
   * @param {number} limit - Maximum number of activities to return
   * @returns {Promise} List of recent activities
   */
  async getRecentActivity(limit = 10) {
    return this.callWithRoleCheck('get', `/dashboard/recent-activity?limit=${limit}`, null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get AI-detected patterns (ADMIN only)
   * @param {number} days - Number of days to look back
   * @returns {Promise} Detected patterns
   */
  async getTicketPatterns(days = 30) {
    return this.callWithRoleCheck('get', `/dashboard/patterns?days=${days}`, null, USER_ROLES.ADMIN);
  }

  /**
   * Get department performance metrics (ADMIN, SUPPORT only)
   * @returns {Promise} Department performance metrics
   */
  async getDepartmentPerformance() {
    return this.callWithRoleCheck('get', '/dashboard/department-performance', null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get all responses for a ticket (ADMIN, SUPPORT only)
   * @param {string} ticketId - Ticket ID
   * @returns {Promise} List of responses for the ticket
   */
  async getResponsesByTicket(ticketId) {
    return this.callWithRoleCheck('get', `/tickets/${ticketId}`, null, [USER_ROLES.ADMIN, USER_ROLES.SUPPORT]);
  }

  /**
   * Get public responses for a ticket (Any authenticated user)
   * @param {string} ticketId - Ticket ID
   * @returns {Promise} List of public responses for the ticket
   */
  async getPublicResponsesByTicket(ticketId) {
    return this.callWithRoleCheck('get', `/tickets/${ticketId}`);
  }


  // ==================== USER APIs ====================
  
  /**
   * Get current user profile
   * @returns {Promise} Current user profile
   */
  async getCurrentUserProfile() {
    try {
      // Check both storage keys for user data
      let userId = null;
      let userDataStr = localStorage.getItem('user_data');
      let userInfoStr = localStorage.getItem(USER_KEY);
      
      console.log('localStorage contents:', {
        user_data: userDataStr,
        user_info: userInfoStr
      });
      
      // Try to get user ID from user_data first (which has the ID)
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData.id;
          console.log('Found user ID in user_data:', userId);
        } catch (e) {
          console.error('Error parsing user_data:', e);
        }
      }
      
      // If no ID found, try user_info
      if (!userId && userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          userId = userInfo.id;
          console.log('Found user ID in user_info:', userId);
        } catch (e) {
          console.error('Error parsing user_info:', e);
        }
      }
      
      if (!userId) {
        console.error('No user ID found in localStorage');
        return { data: null, error: 'User ID not found' };
      }
      
      console.log('Fetching profile for user ID:', userId);
      const response = await this.api.get(`/profiles/${userId}`);
      
      // Update both storage locations with consistent data
      if (response && response.id) {
        const updatedUser = {
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          role: response.role
        };
        
        // Update both storage locations
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        console.log('Updated user data in localStorage with:', updatedUser);
      }
      
      // If response includes a new token, update it
      if (response && response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
      }
      
      return { data: response, error: null, originalData: response };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Updated user profile
   */
  async updateUserProfile(profileData) {
    try {
      // Check both storage keys for user data
      let userId = null;
      let userDataStr = localStorage.getItem('user_data');
      let userInfoStr = localStorage.getItem(USER_KEY);
      
      // Try to get user ID from user_data first (which has the ID)
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData.id;
          console.log('Found user ID in user_data:', userId);
        } catch (e) {
          console.error('Error parsing user_data:', e);
        }
      }
      
      // If no ID found, try user_info
      if (!userId && userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          userId = userInfo.id;
          console.log('Found user ID in user_info:', userId);
        } catch (e) {
          console.error('Error parsing user_info:', e);
        }
      }
      
      if (!userId) {
        console.error('No user ID found in localStorage');
        return { data: null, error: 'User ID not found' };
      }
      
      console.log('Updating profile for user ID:', userId);
      const response = await this.api.put(`/profiles/${userId}`, profileData);
      
      // Update both storage locations with consistent data
      if (response && response.id) {
        const updatedUser = {
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
          department: response.department
        };
        
        // Update both storage locations
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        console.log('Updated user data in localStorage with:', updatedUser);
      }
      
      // If response includes a new token, update it
      if (response && response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
      }
      
      return { data: response, error: null, originalData: response };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error: error.message };
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
