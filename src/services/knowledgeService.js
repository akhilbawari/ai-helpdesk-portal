import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import authService from './authService';

const API_URL = `${API_BASE_URL}/knowledge`;

class KnowledgeService {
  constructor() {
    this.getAuthHeader = () => {
      const token = authService.getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    };
  }

  async getAllDocuments(publishedOnly = true) {
    try {
      const response = await axios.get(`${API_URL}?publishedOnly=${publishedOnly}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching knowledge documents:', error);
      throw error;
    }
  }

  async getDocumentById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching knowledge document ${id}:`, error);
      throw error;
    }
  }

  async createDocument(document, userId) {
    try {
      const response = await axios.post(`${API_URL}?userId=${userId}`, document, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating knowledge document:', error);
      throw error;
    }
  }

  async updateDocument(id, document, userId) {
    try {
      const response = await axios.put(`${API_URL}/${id}?userId=${userId}`, document, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating knowledge document ${id}:`, error);
      throw error;
    }
  }

  async deleteDocument(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting knowledge document ${id}:`, error);
      throw error;
    }
  }

  async searchDocuments(query, publishedOnly = true) {
    try {
      const response = await axios.get(`${API_URL}/search?query=${encodeURIComponent(query)}&publishedOnly=${publishedOnly}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching knowledge documents:', error);
      throw error;
    }
  }

  async getRelevantDocuments(ticketId) {
    try {
      const response = await axios.get(`${API_URL}/relevant/${ticketId}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching relevant documents for ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async getDocumentsByDepartment(department, publishedOnly = true) {
    try {
      const response = await axios.get(`${API_URL}/department/${department}?publishedOnly=${publishedOnly}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching documents for department ${department}:`, error);
      throw error;
    }
  }

  async getDocumentsByType(documentType, publishedOnly = true) {
    try {
      const response = await axios.get(`${API_URL}/type/${documentType}?publishedOnly=${publishedOnly}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching documents of type ${documentType}:`, error);
      throw error;
    }
  }

  async getDocumentsByTag(tag, publishedOnly = true) {
    try {
      const response = await axios.get(`${API_URL}/tag/${tag}?publishedOnly=${publishedOnly}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching documents with tag ${tag}:`, error);
      throw error;
    }
  }
}

const knowledgeService = new KnowledgeService();
export default knowledgeService;
