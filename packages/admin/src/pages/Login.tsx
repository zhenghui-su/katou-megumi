import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Space,
  Avatar,
  Layout,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../utils/api';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(values);
      const data = response.data;

      if (data.success) {
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || '登录失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
            }}
            variant="outlined"
          >
            <div style={{ padding: 40 }}>
              <Space
                direction="vertical"
                size="large"
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Avatar
                  size={80}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    margin: '0 auto',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                  }}
                  icon={
                    <SafetyCertificateOutlined
                      style={{ fontSize: 40, color: 'white' }}
                    />
                  }
                />

                <div>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontWeight: 700,
                    }}
                  >
                    后台管理系统
                  </Title>
                  <Text
                    style={{
                      color: 'rgba(0, 0, 0, 0.6)',
                      fontSize: 16,
                    }}
                  >
                    请使用管理员账号登录
                  </Text>
                </div>

                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 0 }}
                  />
                )}

                <Form
                  form={form}
                  name="login"
                  onFinish={handleSubmit}
                  autoComplete="off"
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名!' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名"
                      style={{
                        borderRadius: 8,
                        height: 48,
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码!' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      style={{
                        borderRadius: 8,
                        height: 48,
                      }}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={{
                        width: '100%',
                        height: 48,
                        fontSize: 16,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: 8,
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                      }}
                    >
                      {loading ? '登录中...' : '登录'}
                    </Button>
                  </Form.Item>
                </Form>
              </Space>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
