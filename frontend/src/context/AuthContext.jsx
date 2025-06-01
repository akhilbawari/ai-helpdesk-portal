import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiService } from '../services';

// Create context with default values to prevent undefined errors
const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  updateProfile: () => Promise.resolve()
});

// Name of the localStorage key for storing user data
const USER_DATA_KEY = 'user_data';
const AUTH_TOKEN_NAME = 'auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_NAME);
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to get user data from local storage
        const userDataString = localStorage.getItem(USER_DATA_KEY);
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            console.log('Found user data in localStorage:', userData);
            
            if (userData) {
              setUser(userData);
              
              // If we have a user ID, fetch the profile
              if (userData.id) {
                await fetchProfile(userData.id);
              } else if (userData.userId) {
                await fetchProfile(userData.userId);
              }
            }
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const fetchProfile = async (userId) => {
    if (!userId) {
      console.warn('Cannot fetch profile: No user ID provided');
      return;
    }
    
    try {
      console.log('Fetching profile for user ID:', userId);
      // Using centralized apiService for profile fetching
      const { data, error } = await apiService.getCurrentUserProfile();
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      if (data) {
        console.log('Profile data received:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔄 Starting login process...');
      // Using centralized apiService for login
      const { data, error, originalData } = await apiService.login(email, password);
      console.log('📦 Login response:', { data, error, originalData });
      
      if (error) {
        console.log('❌ Login error detected:', error);
        toast.error(error);
        return { data, error, originalData };
      }
      
      if (data) {
        let userData = null;
        
        // Handle different response formats
        if (data.user) {
          console.log('✅ Login successful, setting user data from data.user:', data.user);
          userData = data.user;
          setUser(userData);
          
          // Fetch profile if we have a user ID
          const userId = data.user.id;
          if (userId) {
            console.log('🔄 Fetching user profile for ID:', userId);
            await fetchProfile(userId);
          } else {
            console.warn('⚠️ No user ID available in data.user');
          }
        } else if (data.userId) {
          // Create a user object from the direct response
          userData = {
            id: data.userId,
            email: data.email,
            role: data.role
          };
          console.log('✅ Login successful, creating user object:', userData);
          setUser(userData);
          
          // Fetch profile using userId from response
          console.log('🔄 Fetching user profile for ID:', data.userId);
          await fetchProfile(data.userId);
        } else {
          console.warn('⚠️ No user data available in response');
        }
        
        // Store user data in localStorage for session persistence
        if (userData) {
          console.log('💾 Storing user data in localStorage');
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        }
        
        // Show success toast
        const successMessage = originalData?.message || 'Login successful';
        console.log('🔔 Showing success toast:', successMessage);
        toast.success(successMessage);
        
        // Use setTimeout to ensure toast is visible before redirect
        console.log('🔄 Preparing to redirect to dashboard...');
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard now');
          window.location.replace('/dashboard');
        }, 1000);
      } else {
        console.error('❌ Login response missing user data:', data);
        toast.error('Invalid login response. Please try again.');
      }
      
      return { data, error: null, originalData };
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in. Please try again.');
      return { data: null, error, originalData: null };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      const registerData = {
        email,
        password,
        fullName: userData.full_name,
        department: userData.department,
        role: 'EMPLOYEE' // Default role
      };
      
      // Using centralized apiService for registration
      const { data, error, originalData } = await apiService.register(registerData);
      if (error) {
        toast.error(error);
        throw error;
      }
      
      console.log('Registration response:', data);
      
      // Set user and profile if registration was successful
      if (data) {
        // Store token if available
        if (data.token) {
          localStorage.setItem(AUTH_TOKEN_NAME, data.token);
        }
        
        // Create user object from response data
        const userObj = {
          id: data.userId,
          userId: data.userId,
          email: data.email,
          role: data.role,
          fullName: data.name || registerData.fullName
        };
        
        console.log('✅ Registration successful, creating user object:', userObj);
        setUser(userObj);
        
        // Store user data in localStorage for session persistence
        console.log('💾 Storing user data in localStorage with ID:', userObj.id);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userObj));
        
        // Also store in user_info for compatibility
        localStorage.setItem('user_info', JSON.stringify(userObj));
        
        // Fetch profile if we have a user ID
        if (userObj.id) {
          console.log('🔄 Fetching user profile for ID:', userObj.id);
          await fetchProfile(userObj.id);
        }
        
        // Show success toast
        toast.success(originalData?.message || 'Registration successful!');
        
        // Use setTimeout to ensure toast is visible before redirect
        console.log('🔄 Preparing to redirect to dashboard...');
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard now');
          window.location.replace('/dashboard');
        }, 1000);
      }
      
      return { data, error: null, originalData };
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Failed to sign up. Please try again.');
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Using centralized apiService for logout
      const { error, originalData } = await apiService.logout();
      
      if (error) {
        toast.error(error);
        return;
      }
      
      // Clear user and profile state
      setUser(null);
      setProfile(null);
      
      // Clear user data from localStorage
      console.log('🗑️ Clearing user data from localStorage');
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(AUTH_TOKEN_NAME);
      
      // Show success toast
      toast.success(originalData?.message || 'Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    setUser,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
