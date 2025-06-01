import apiClient from '../utils/apiClient';

const ticketService = {
  // Get all tickets (admin/support only)
  getAllTickets: async () => {
    try {
      const response = await apiClient.get('/tickets');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await apiClient.get(`/tickets/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get tickets created by a user
  getTicketsByCreatedBy: async (userId) => {
    try {
      const response = await apiClient.get(`/tickets/created-by/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get tickets assigned to a user
  getTicketsByAssignedTo: async (userId) => {
    try {
      const response = await apiClient.get(`/tickets/assigned-to/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get tickets by status
  getTicketsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/tickets/status/${status}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get tickets by category
  getTicketsByCategory: async (category) => {
    try {
      const response = await apiClient.get(`/tickets/category/${category}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get tickets by priority
  getTicketsByPriority: async (priority) => {
    try {
      const response = await apiClient.get(`/tickets/priority/${priority}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get tickets by category and status
  getTicketsByCategoryAndStatus: async (category, status) => {
    try {
      const response = await apiClient.get(`/tickets/category/${category}/status/${status}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Create a new ticket
  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/tickets', ticketData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Update a ticket
  updateTicket: async (id, ticketData) => {
    try {
      const response = await apiClient.put(`/tickets/${id}`, ticketData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Assign a ticket to a user
  assignTicket: async (ticketId, assigneeId) => {
    try {
      const response = await apiClient.put(`/tickets/${ticketId}/assign/${assigneeId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Delete a ticket (admin only)
  deleteTicket: async (id) => {
    try {
      await apiClient.delete(`/tickets/${id}`);
      return { error: null };
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
};

export default ticketService;
