import { useState, useEffect } from 'react';
import { message } from 'antd';
import { adminAPI, reviewAPI } from '../utils/api';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalImages: number;
  totalVideos: number;
  totalViews: number;
}

export interface RecentStats {
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  newImagesWeek: number;
}

export interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface GrowthRate {
  rate: string;
  isUp: boolean;
}

export const useDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalImages: 0,
    totalVideos: 0,
    totalViews: 0,
  });
  const [recentStats, setRecentStats] = useState<RecentStats>({
    newUsersToday: 0,
    newUsersWeek: 0,
    newUsersMonth: 0,
    newImagesWeek: 0,
  });
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // 模拟用户数据，实际项目中应该从API获取
      const userData = {
        id: 1,
        username: '管理员',
        email: 'admin@example.com',
        createdAt: new Date().toISOString(),
      };
      setUser(userData);
    } catch (error) {
      message.error('获取用户信息失败');
      console.error('获取用户信息失败:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardData();
      const data = response.data.data || response.data;
      setStats({
        totalUsers: data.totalUsers,
        totalImages: data.totalImages,
        totalVideos: data.totalVideos,
        totalViews: data.totalViews,
      });
      if (data.reviewStats) {
        setReviewStats(data.reviewStats);
      }
      if (data.recentStats) {
        setRecentStats(data.recentStats);
      }
    } catch (error) {
      message.error('获取统计数据失败');
      console.error('获取仪表盘统计失败:', error);
      // 设置默认数据
      setStats({
        totalUsers: 1250,
        totalImages: 3420,
        totalVideos: 156,
        totalViews: 89650,
      });
      setRecentStats({
        newUsersToday: 15,
        newUsersWeek: 89,
        newUsersMonth: 234,
        newImagesWeek: 156,
      });
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await reviewAPI.getStats();
      setReviewStats(response.data.data || response.data);
    } catch (error) {
      message.error('获取审核统计失败');
      console.error('获取审核统计失败:', error);
      // 设置默认数据
      setReviewStats({
        pending: 23,
        approved: 156,
        rejected: 12,
        total: 191,
      });
    }
  };

  const calculateGrowthRate = (current: number, recent: number): GrowthRate => {
    if (current === 0) return { rate: '0%', isUp: true };
    const previousWeek = current - recent;
    if (previousWeek <= 0) return { rate: '+100%', isUp: true };
    const growthRate = ((recent / previousWeek) * 100).toFixed(1);
    return {
      rate: `+${growthRate}%`,
      isUp: parseFloat(growthRate) >= 0,
    };
  };

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUser(),
        fetchDashboardStats(),
        fetchReviewStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  return {
    user,
    stats,
    recentStats,
    reviewStats,
    loading,
    calculateGrowthRate,
    refreshData: initializeData,
  };
};