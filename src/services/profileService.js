import apiClient from '../utils/apiClient';

const profileService = {
  // Get current user's profile
  getCurrentProfile: async (userId) => {
    try {
      if (!userId) {
        console.error('No user ID provided to getCurrentProfile');
        return { data: null, error: 'User ID is required' };
      }
      const response = await apiClient.get(`/profiles/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get profile by ID
  getProfileById: async (id) => {
    try {
      const response = await apiClient.get(`/profiles/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get profile by email
  getProfileByEmail: async (email) => {
    try {
      const response = await apiClient.get(`/profiles/email/${email}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get profiles by department
  getProfilesByDepartment: async (department) => {
    try {
      const response = await apiClient.get(`/profiles/department/${department}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get profiles by role
  getProfilesByRole: async (role) => {
    try {
      const response = await apiClient.get(`/profiles/role/${role}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Update profile
  updateProfile: async (id, profileData) => {
    try {
      const response = await apiClient.put(`/profiles/${id}`, profileData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get all profiles (admin only)
  getAllProfiles: async () => {
    try {
      const response = await apiClient.get('/profiles');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  }
};

export default profileService;
