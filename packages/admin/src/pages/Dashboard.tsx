import React from 'react';
import { Card, Row, Col, Space, Spin } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';
import { createStatCards, createReviewCards } from '../config/dashboardConfig';
import { WelcomeCard, StatCard, ReviewCard } from '../components/Dashboard';

const Dashboard: React.FC = () => {
  const {
    user,
    stats,
    recentStats,
    reviewStats,
    loading,
    calculateGrowthRate,
  } = useDashboard();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const userGrowth = calculateGrowthRate(stats.totalUsers, recentStats.newUsersWeek);
  const imageGrowth = calculateGrowthRate(stats.totalImages, recentStats.newImagesWeek);

  const statCards = createStatCards(
    stats.totalUsers,
    stats.totalImages,
    stats.totalVideos,
    stats.totalViews,
    userGrowth,
    imageGrowth
  );

  const reviewCards = createReviewCards(
    reviewStats.pending,
    reviewStats.approved,
    reviewStats.rejected,
    reviewStats.total
  );

  return (
    <div
      style={{
        padding: '24px',
        background: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {/* 欢迎信息 */}
      <WelcomeCard user={user} />

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <StatCard stat={card} index={index} />
          </Col>
        ))}
      </Row>

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
                <ReviewCard review={card} index={index} />
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
