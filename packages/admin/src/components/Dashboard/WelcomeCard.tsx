import React from 'react';
import { Card, Row, Col, Typography, Space, Tag } from 'antd';
import { motion } from 'framer-motion';
import { welcomeCardConfig } from '../../config/dashboardConfig';
import type { User } from '../../hooks/useDashboard';

const { Title, Text } = Typography;

interface WelcomeCardProps {
  user: User | null;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        style={{
          marginBottom: 24,
          background: welcomeCardConfig.background,
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
              {welcomeCardConfig.statusTags.map((tag, index) => (
                <Tag key={index} color={tag.color} icon={tag.icon}>
                  {tag.text}
                </Tag>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};