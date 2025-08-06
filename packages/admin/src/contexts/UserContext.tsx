import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../utils/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setUserProfile(null);
      return;
    }

    try {
      const response = await authAPI.getProfile();
      const profile = response.data.data;
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // 如果获取失败，清除用户信息
      setUserProfile(null);
    }
  };

  useEffect(() => {
    // 只在有token时才获取用户信息
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  const value = {
    userProfile,
    setUserProfile,
    updateUserProfile,
    fetchUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};