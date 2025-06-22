import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Define user type
export type User = {
  id: string;
  name: string;
  email: string;
  panNumber?: string;
  idProofType?: string;
  idProofNumber?: string;
  panCardImage?: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  kycRejectionReason?: string;
  withdrawableAmount: string;
  // Add other user fields as needed
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

// Auth provider props type
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/user/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    await fetchUser();
  };

  // Function to handle logout
  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      // Clear any cached queries
      queryClient.clear();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Provide auth context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    refreshUser,
    logout
  };

  // In a .ts file we need to avoid JSX syntax
  return AuthContext.Provider({ value, children });
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}