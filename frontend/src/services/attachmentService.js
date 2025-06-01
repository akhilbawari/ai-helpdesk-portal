import apiClient from '../utils/apiClient';

const attachmentService = {
  // Get all attachments (admin only)
  getAllAttachments: async () => {
    try {
      const response = await apiClient.get('/attachments');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get attachment by ID
  getAttachmentById: async (id) => {
    try {
      const response = await apiClient.get(`/attachments/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get attachments by ticket
  getAttachmentsByTicket: async (ticketId) => {
    try {
      const response = await apiClient.get(`/attachments/ticket/${ticketId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Get attachments by uploader
  getAttachmentsByUploader: async (uploaderId) => {
    try {
      const response = await apiClient.get(`/attachments/uploader/${uploaderId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Upload an attachment
  uploadAttachment: async (ticketId, file) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('ticketId', ticketId);
      formData.append('file', file);

      const response = await apiClient.post('/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Download an attachment
  downloadAttachment: async (id) => {
    try {
      const response = await apiClient.get(`/attachments/download/${id}`, {
        responseType: 'blob',
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  // Delete an attachment
  deleteAttachment: async (id) => {
    try {
      await apiClient.delete(`/attachments/${id}`);
      return { error: null };
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
};

export default attachmentService;
