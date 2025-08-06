import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { cardStyles, iconStyles } from '../../config/dashboardConfig';
import type { StatCard as StatCardType } from '../../config/dashboardConfig';

const { Title, Text } = Typography;

interface StatCardProps {
  stat: StatCardType;
  index: number;
}

export const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card
        hoverable
        style={{
          ...cardStyles,
          height: '100%',
        }}
      >
        <Row justify="space-between" align="top">
          <Col>
            <div
              style={{
                ...iconStyles,
                backgroundColor: `${stat.color}15`,
              }}
            >
              {stat.icon}
            </div>
            <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
              {stat.title}
            </Title>
            <Title level={2} style={{ margin: 0, color: stat.color }}>
              {stat.value.toLocaleString()}
            </Title>
          </Col>
        </Row>
        <div style={{ marginTop: 16 }}>
          <Space>
            {stat.isUp ? (
              <ArrowUpOutlined style={{ color: '#52c41a' }} />
            ) : (
              <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
            )}
            <Text
              style={{
                color: stat.isUp ? '#52c41a' : '#ff4d4f',
                fontWeight: 500,
              }}
            >
              {stat.trend}
            </Text>
            <Text type="secondary">较上周</Text>
          </Space>
        </div>
      </Card>
    </motion.div>
  );
};