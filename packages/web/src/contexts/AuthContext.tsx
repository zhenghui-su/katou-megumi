import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authAPI } from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  setAuthData: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('user_token');
        const savedUser = localStorage.getItem('user_data');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login({ username, password });
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user_token', userToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.response?.data?.message || '登录失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register({ username, email, password });
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user_token', userToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.response?.data?.message || '注册失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setAuthData = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    setAuthData,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
