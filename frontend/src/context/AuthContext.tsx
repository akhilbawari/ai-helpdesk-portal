import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile, saveAuthData, isAuthenticated } from '../api/auth';

// User profile type
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'employee' | 'support_agent' | 'team_lead' | 'admin';
  department: string;
}

// Login credentials type
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data type
interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
}

// Auth context value type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (isAuthenticated()) {
          const userProfile = await getProfile();
          setUser(userProfile as User);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        // Token might be invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiLogin(credentials);
      saveAuthData(data);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role as 'employee' | 'support_agent' | 'team_lead' | 'admin',
        department: data.department
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await apiRegister(data);
      saveAuthData(userData);
      setUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role as 'employee' | 'support_agent' | 'team_lead' | 'admin',
        department: userData.department
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    
    try {
      await apiLogout();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};