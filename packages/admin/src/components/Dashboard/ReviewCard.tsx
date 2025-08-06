import React from 'react';
import { Card, Typography, Progress } from 'antd';
import { motion } from 'framer-motion';
import { cardStyles, reviewIconStyles } from '../../config/dashboardConfig';
import type { ReviewCard as ReviewCardType } from '../../config/dashboardConfig';

const { Title, Text } = Typography;

interface ReviewCardProps {
  review: ReviewCardType;
  index: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card
        hoverable
        style={{
          ...cardStyles,
          textAlign: 'center',
          height: '100%',
        }}
      >
        <div
          style={{
            ...reviewIconStyles,
            backgroundColor: `${review.color}15`,
            color: review.color,
          }}
        >
          {review.icon}
        </div>
        <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
          {review.value}
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          {review.title}
        </Text>
        <div style={{ marginTop: 16 }}>
          <Progress
            percent={review.percentage}
            strokeColor={review.color}
            showInfo={false}
            size="small"
          />
          <Text
            style={{
              color: review.color,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {review.percentage}%
          </Text>
        </div>
      </Card>
    </motion.div>
  );
};