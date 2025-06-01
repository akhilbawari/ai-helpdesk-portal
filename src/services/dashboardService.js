import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import authService from './authService';

const API_URL = `${API_BASE_URL}/dashboard`;

class DashboardService {
  constructor() {
    this.getAuthHeader = () => {
      const token = authService.getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    };
  }

  async getTicketMetrics(timeRange = 'WEEK') {
    try {
      const response = await axios.get(`${API_URL}/metrics?timeRange=${timeRange}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ticket metrics:', error);
      throw error;
    }
  }

  async getRecentActivity(limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/recent-activity?limit=${limit}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  async getAIPatterns() {
    try {
      const response = await axios.get(`${API_URL}/ai-patterns`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching AI patterns:', error);
      throw error;
    }
  }

  async getDepartmentPerformance(timeRange = 'MONTH') {
    try {
      const response = await axios.get(`${API_URL}/department-performance?timeRange=${timeRange}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department performance:', error);
      throw error;
    }
  }

  async getTicketsByStatus() {
    try {
      const response = await axios.get(`${API_URL}/tickets-by-status`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tickets by status:', error);
      throw error;
    }
  }

  async getTicketsByDepartment() {
    try {
      const response = await axios.get(`${API_URL}/tickets-by-department`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tickets by department:', error);
      throw error;
    }
  }

  async getTicketsByPriority() {
    try {
      const response = await axios.get(`${API_URL}/tickets-by-priority`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tickets by priority:', error);
      throw error;
    }
  }

  async getAverageResolutionTime(timeRange = 'MONTH') {
    try {
      const response = await axios.get(`${API_URL}/average-resolution-time?timeRange=${timeRange}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching average resolution time:', error);
      throw error;
    }
  }

  async getAIRoutingAccuracy(timeRange = 'MONTH') {
    try {
      const response = await axios.get(`${API_URL}/ai-routing-accuracy?timeRange=${timeRange}`, {
        headers: this.getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching AI routing accuracy:', error);
      throw error;
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
