// API and application constants

// Base URL for API calls
export const API_BASE_URL = 'http://localhost:8080/api';

// Authentication constants
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_info';

// Ticket status constants
export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  PENDING: 'PENDING'
};

// Ticket priority constants
export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
  EMPLOYEE: 'EMPLOYEE'
};

// WebSocket constants
export const WEBSOCKET_ENDPOINT = '/api/ws';
export const STOMP_BROKER_ENDPOINT = '/topic';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 0;

// Dashboard time ranges
export const TIME_RANGES = {
  TODAY: 'TODAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  YEAR: 'YEAR'
};
