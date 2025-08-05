import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Progress,
  Tag,
  message,
} from 'antd';
import {
  UserOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { adminAPI, reviewAPI } from '../utils/api';

const { Title, Text } = Typography;

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalImages: number;
  totalVideos: number;
  totalViews: number;
}

interface RecentStats {
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  newImagesWeek: number;
}

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const Dashboard: React.FC = () => {
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

  useEffect(() => {
    fetchUser();
    fetchDashboardStats();
    fetchReviewStats();
  }, []);

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

  // 计算增长率
  const calculateGrowthRate = (current: number, recent: number): { rate: string; isUp: boolean } => {
    if (current === 0) return { rate: '0%', isUp: true };
    const previousWeek = current - recent;
    if (previousWeek <= 0) return { rate: '+100%', isUp: true };
    const growthRate = ((recent / previousWeek) * 100).toFixed(1);
    return {
      rate: `+${growthRate}%`,
      isUp: parseFloat(growthRate) >= 0,
    };
  };

  const userGrowth = calculateGrowthRate(stats.totalUsers, recentStats.newUsersWeek);
  const imageGrowth = calculateGrowthRate(stats.totalImages, recentStats.newImagesWeek);
  const videoGrowth = { rate: '+5.2%', isUp: true }; // 视频增长率暂时使用固定值
  const viewGrowth = { rate: '+18.5%', isUp: true }; // 浏览量增长率暂时使用固定值

  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      color: '#1890ff',
      trend: userGrowth.rate,
      isUp: userGrowth.isUp,
    },
    {
      title: '总图片数',
      value: stats.totalImages,
      icon: <PictureOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      color: '#52c41a',
      trend: imageGrowth.rate,
      isUp: imageGrowth.isUp,
    },
    {
      title: '总视频数',
      value: stats.totalVideos,
      icon: <VideoCameraOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      color: '#722ed1',
      trend: videoGrowth.rate,
      isUp: videoGrowth.isUp,
    },
    {
      title: '总浏览量',
      value: stats.totalViews,
      icon: <EyeOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      color: '#fa8c16',
      trend: viewGrowth.rate,
      isUp: viewGrowth.isUp,
    },
  ];

  const reviewCards = [
    {
      title: '待审核',
      value: reviewStats.pending,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      percentage:
        reviewStats.total > 0
          ? Math.round((reviewStats.pending / reviewStats.total) * 100)
          : 0,
    },
    {
      title: '已通过',
      value: reviewStats.approved,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      percentage:
        reviewStats.total > 0
          ? Math.round((reviewStats.approved / reviewStats.total) * 100)
          : 0,
    },
    {
      title: '已拒绝',
      value: reviewStats.rejected,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
      percentage:
        reviewStats.total > 0
          ? Math.round((reviewStats.rejected / reviewStats.total) * 100)
          : 0,
    },
    {
      title: '总计',
      value: reviewStats.total,
      icon: <BarChartOutlined />,
      color: '#1890ff',
      percentage: 100,
    },
  ];

  // 移除管理功能卡片，这些功能将移到左侧导航栏

  return (
    <div
      style={{
        padding: '24px',
        background: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {/* 欢迎信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
          styles={{
            body: {
              padding: '24px',
            },
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title
                level={2}
                style={{ color: '#fff', margin: 0, marginBottom: 8 }}
              >
                欢迎回来，{user?.username || '管理员'} 👋
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                今天是{' '}
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </Text>
              <br />
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                这里是系统仪表盘，您可以查看网站的各项统计数据和管理功能。
              </Text>
            </Col>
            <Col>
              <Space direction="vertical">
                <Tag color="success" icon={<RiseOutlined />}>
                  系统运行正常
                </Tag>
                <Tag color="processing" icon={<SettingOutlined />}>
                  管理员权限
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: `1px solid ${card.color}20`,
                }}
                styles={{
                  body: { padding: '24px' },
                }}
              >
                <Row justify="space-between" align="top">
                  <Col>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      {card.icon}
                    </div>
                    <Statistic
                      title={card.title}
                      value={card.value}
                      valueStyle={{ color: card.color, fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col>
                    <Tag
                      color={card.isUp ? 'success' : 'error'}
                      icon={
                        card.isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />
                      }
                    >
                      {card.trend}
                    </Tag>
                  </Col>
                </Row>
                <Progress
                  percent={75}
                  strokeColor={card.color}
                  showInfo={false}
                  style={{ marginTop: 16 }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* 管理功能已移至左侧导航栏 */}

      {/* 审核统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card
          title={
            <Space>
              <BarChartOutlined style={{ color: '#1890ff' }} />
              <span>审核统计</span>
            </Space>
          }
          styles={{
            body: { padding: '24px' },
          }}
        >
          <Row gutter={[24, 24]}>
            {reviewCards.map((card, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    hoverable
                    style={{
                      textAlign: 'center',
                      borderRadius: 12,
                      border: `1px solid ${card.color}20`,
                    }}
                    styles={{
                      body: { padding: '24px' },
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: card.color,
                        fontSize: 24,
                      }}
                    >
                      {card.icon}
                    </div>
                    <Statistic
                      title={card.title}
                      value={card.value}
                      valueStyle={{ color: card.color, fontWeight: 'bold' }}
                    />
                    <Progress
                      percent={card.percentage}
                      strokeColor={card.color}
                      style={{ marginTop: 16 }}
                    />
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
