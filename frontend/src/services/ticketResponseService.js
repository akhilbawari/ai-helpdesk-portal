import apiClient from '../utils/apiClient';

const ticketResponseService = {
  // Get all responses (admin only)
  getAllResponses: async () => {
    try {
      const response = await apiClient.get('/ticket-responses');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get response by ID
  getResponseById: async (id) => {
    try {
      const response = await apiClient.get(`/ticket-responses/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get responses by ticket
  getResponsesByTicket: async (ticketId) => {
    try {
      const response = await apiClient.get(`/ticket-responses/ticket/${ticketId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get responses by user
  getResponsesByUser: async (userId) => {
    try {
      const response = await apiClient.get(`/ticket-responses/user/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get internal responses by ticket
  getInternalResponsesByTicket: async (ticketId) => {
    try {
      const response = await apiClient.get(`/ticket-responses/ticket/${ticketId}/internal`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get public responses by ticket
  getPublicResponsesByTicket: async (ticketId) => {
    try {
      const response = await apiClient.get(`/ticket-responses/ticket/${ticketId}/public`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Create a new response
  createResponse: async (responseData) => {
    try {
      const response = await apiClient.post('/ticket-responses', responseData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Update a response
  updateResponse: async (id, responseData) => {
    try {
      const response = await apiClient.put(`/ticket-responses/${id}`, responseData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Delete a response
  deleteResponse: async (id) => {
    try {
      await apiClient.delete(`/ticket-responses/${id}`);
      return { error: null };
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
};

export default ticketResponseService;
