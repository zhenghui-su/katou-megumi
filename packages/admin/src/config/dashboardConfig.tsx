import {
  UserOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  RiseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { GrowthRate } from '../hooks/useDashboard';

export interface StatCard {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  trend: string;
  isUp: boolean;
}

export interface ReviewCard {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  percentage: number;
}

export const createStatCards = (
  totalUsers: number,
  totalImages: number,
  totalVideos: number,
  totalViews: number,
  userGrowth: GrowthRate,
  imageGrowth: GrowthRate,
): StatCard[] => [
  {
    title: '总用户数',
    value: totalUsers,
    icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    color: '#1890ff',
    trend: userGrowth.rate,
    isUp: userGrowth.isUp,
  },
  {
    title: '总图片数',
    value: totalImages,
    icon: <PictureOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
    color: '#52c41a',
    trend: imageGrowth.rate,
    isUp: imageGrowth.isUp,
  },
  {
    title: '总视频数',
    value: totalVideos,
    icon: <VideoCameraOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
    color: '#722ed1',
    trend: '+5.2%', // 视频增长率暂时使用固定值
    isUp: true,
  },
  {
    title: '总浏览量',
    value: totalViews,
    icon: <EyeOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
    color: '#fa8c16',
    trend: '+18.5%', // 浏览量增长率暂时使用固定值
    isUp: true,
  },
];

export const createReviewCards = (
  pending: number,
  approved: number,
  rejected: number,
  total: number,
): ReviewCard[] => [
  {
    title: '待审核',
    value: pending,
    icon: <ClockCircleOutlined />,
    color: '#faad14',
    percentage: total > 0 ? Math.round((pending / total) * 100) : 0,
  },
  {
    title: '已通过',
    value: approved,
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    percentage: total > 0 ? Math.round((approved / total) * 100) : 0,
  },
  {
    title: '已拒绝',
    value: rejected,
    icon: <CloseCircleOutlined />,
    color: '#ff4d4f',
    percentage: total > 0 ? Math.round((rejected / total) * 100) : 0,
  },
  {
    title: '总计',
    value: total,
    icon: <BarChartOutlined />,
    color: '#1890ff',
    percentage: 100,
  },
];

export const welcomeCardConfig = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  statusTags: [
    {
      color: 'success' as const,
      icon: <RiseOutlined />,
      text: '系统运行正常',
    },
    {
      color: 'processing' as const,
      icon: <SettingOutlined />,
      text: '管理员权限',
    },
  ],
};

export const cardStyles = {
  borderRadius: 12,
  padding: '24px',
};

export const iconStyles = {
  width: 48,
  height: 48,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
};

export const reviewIconStyles = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
  fontSize: 24,
};
