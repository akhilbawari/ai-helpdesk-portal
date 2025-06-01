import apiClient from '../utils/apiClient';

const aiService = {
  // Route a ticket to the appropriate department using AI
  routeTicket: async (title, description) => {
    try {
      const response = await apiClient.post('/ai/route-ticket', {
        title,
        description
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get AI-generated response suggestions for a ticket
  suggestResponse: async (ticketTitle, ticketDescription, previousResponses = []) => {
    try {
      const response = await apiClient.post('/ai/suggest-response', {
        ticketTitle,
        ticketDescription,
        previousResponses
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Detect patterns in recent tickets (admin only)
  detectPatterns: async (recentTickets) => {
    try {
      const response = await apiClient.post('/ai/detect-patterns', {
        recentTickets
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  }
};

export default aiService;
