import { CrownOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export const getRoleTag = (role: string) => {
  const roleConfig = {
    admin: { color: 'red', icon: <CrownOutlined />, text: '管理员' },
    moderator: { color: 'blue', icon: <SafetyOutlined />, text: '版主' },
    user: { color: 'green', icon: <UserOutlined />, text: '普通用户' },
  };
  const config = roleConfig[role as keyof typeof roleConfig];
  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};

export const getStatusTag = (status: string) => {
  const statusConfig = {
    active: { color: 'success', text: '正常' },
    inactive: { color: 'warning', text: '未激活' },
    banned: { color: 'error', text: '已封禁' },
  };
  const config = statusConfig[status as keyof typeof statusConfig];
  return <Tag color={config.color}>{config.text}</Tag>;
};
