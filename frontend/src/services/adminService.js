import apiClient from '../utils/apiClient';

const adminService = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId, role) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  /**
   * Bulk import users from CSV data
   */
  bulkImportUsers: async (users) => {
    try {
      const response = await apiClient.post('/admin/users/bulk-import', { users });
      return response.data;
    } catch (error) {
      console.error('Error bulk importing users:', error);
      throw error;
    }
  },

  /**
   * Get user activities for a specific user
   */
  getUserActivities: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/user-activities?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  },

  /**
   * Get all user activities
   */
  getAllUserActivities: async () => {
    try {
      const response = await apiClient.get('/admin/user-activities');
      return response.data;
    } catch (error) {
      console.error('Error fetching all user activities:', error);
      throw error;
    }
  },

  /**
   * Get user activities with filters
   */
  getUserActivitiesWithFilters: async (queryParams) => {
    try {
      const response = await apiClient.get(`/admin/user-activities?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered user activities:', error);
      throw error;
    }
  },

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

export default adminService;
