import apiClient from './config';

/**
 * User authentication data
 */
interface AuthData {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
}

/**
 * Response format from API
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { message: string; path: string[] }[];
}

/**
 * User profile data
 */
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login user with email and password
 * @param credentials - Login credentials
 * @returns User authentication data
 */
export const login = async (credentials: LoginCredentials): Promise<AuthData> => {
  const response = await apiClient.post<ApiResponse<AuthData>>('/auth/login', credentials);
  return response.data.data as AuthData;
};

/**
 * Register a new user
 * @param userData - User registration data
 * @returns User authentication data
 */
export const register = async (userData: RegisterData): Promise<AuthData> => {
  const response = await apiClient.post<ApiResponse<AuthData>>('/auth/register', userData);
  return response.data.data as AuthData;
};

/**
 * Get current user profile
 * @returns User profile data
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/profile');
  return response.data.data as UserProfile;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

/**
 * Refresh access token
 * @param refreshToken - Current refresh token
 * @returns New authentication tokens
 */
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
  return response.data.data as { accessToken: string; refreshToken: string };
};

/**
 * Save authentication data to localStorage
 * @param data - Authentication data to save
 */
export const saveAuthData = (data: AuthData): void => {
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};

/**
 * Check if user is authenticated
 * @returns True if user has a valid token
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};