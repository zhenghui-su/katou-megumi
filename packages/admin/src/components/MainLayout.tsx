import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  message,
  Modal,
  Form,
  Input,
  Button,
} from 'antd';
import {
  DashboardOutlined,
  NotificationOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  SendOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Review from '../pages/Review';
import { notificationAPI } from '../utils/api';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
    path: '/dashboard',
  },
  {
    key: 'review',
    icon: <AuditOutlined />,
    label: '内容审核',
    path: '/review',
  },
  {
    key: 'management',
    icon: <SettingOutlined />,
    label: '内容管理',
    children: [
      {
        key: 'images',
        icon: <PictureOutlined />,
        label: '图片管理',
        path: '/admin/images',
      },
      {
        key: 'videos',
        icon: <VideoCameraOutlined />,
        label: '视频管理',
        path: '/admin/videos',
      },
    ],
  },
];

// 路由保护组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取当前选中的菜单项
  const findSelectedKey = (items: MenuItem[], pathname: string): string => {
    for (const item of items) {
      if (item.path === pathname) {
        return item.key;
      }
      if (item.children) {
        const found = findSelectedKey(item.children, pathname);
        if (found) return found;
      }
    }
    return 'dashboard';
  };

  const selectedKey = findSelectedKey(menuItems, location.pathname);

  const findMenuItemByKey = (
    items: MenuItem[],
    key: string,
  ): MenuItem | undefined => {
    for (const item of items) {
      if (item.key === key) {
        return item;
      }
      if (item.children) {
        const found = findMenuItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleMenuClick = (key: string) => {
    const item = findMenuItemByKey(menuItems, key);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    message.success('退出登录成功');
    navigate('/login');
  };

  const handleNotificationSubmit = async (values: {
    title: string;
    content: string;
  }) => {
    setNotificationLoading(true);
    try {
      const response = await notificationAPI.createSystemNotification(values);
      const data = response.data;
      if (data.success) {
        message.success(data.message || '系统通知发送成功！');
        notificationForm.resetFields();
        setNotificationModalOpen(false);
      } else {
        message.error(data.message || '发送失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '网络错误，请稍后重试');
    } finally {
      setNotificationLoading(false);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        {/* 侧边栏 */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: '#001529',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          }}
        >
          {/* Logo区域 */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 16,
            }}
          >
            <Title
              level={4}
              style={{
                color: 'white',
                margin: 0,
                fontSize: collapsed ? 16 : 18,
                transition: 'all 0.3s',
              }}
            >
              {collapsed ? 'KM' : 'Katou Megumi'}
            </Title>
          </div>

          {/* 导航菜单 */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{
              background: 'transparent',
              border: 'none',
            }}
            onClick={({ key }) => handleMenuClick(key)}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              children: item.children?.map((child) => ({
                key: child.key,
                icon: child.icon,
                label: child.label,
              })),
              style: {
                margin: '4px 8px',
                borderRadius: 8,
                height: 48,
                lineHeight: '48px',
              },
            }))}
          />
        </Sider>

        <Layout>
          {/* 顶部导航栏 */}
          <Header
            style={{
              padding: '0 24px',
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Space>
              {/* 折叠按钮 */}
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: 6,
                  transition: 'all 0.3s',
                  color: '#666',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>

              {/* 页面标题 */}
              <Title level={4} style={{ margin: 0, color: '#333' }}>
                {findMenuItemByKey(menuItems, selectedKey)?.label || '仪表盘'}
              </Title>
            </Space>

            <Space>
              {/* 系统通知按钮 */}
              <Button
                type="text"
                icon={<NotificationOutlined />}
                onClick={() => setNotificationModalOpen(true)}
                style={{
                  borderRadius: 8,
                  color: '#666',
                }}
              >
                系统通知
              </Button>

              {/* 用户信息 */}
              <Dropdown
                menu={{
                  items: userMenuItems,
                }}
                placement="bottomRight"
                arrow
              >
                <Space
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 8,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                    }}
                  />
                  <span style={{ color: '#333', fontWeight: 500 }}>管理员</span>
                </Space>
              </Dropdown>
            </Space>
          </Header>

          {/* 主要内容区域 */}
          <Content
            style={{
              margin: 0,
              background: '#f0f2f5',
              overflow: 'auto',
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/review" element={<Review />} />
            </Routes>
          </Content>
        </Layout>

        {/* 系统通知Modal */}
        <Modal
          title="发送系统通知"
          open={notificationModalOpen}
          onCancel={() => {
            setNotificationModalOpen(false);
            notificationForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={notificationForm}
            layout="vertical"
            onFinish={handleNotificationSubmit}
          >
            <Form.Item
              label="通知标题"
              name="title"
              rules={[
                { required: true, message: '请输入通知标题' },
                { max: 100, message: '标题不能超过100个字符' },
              ]}
            >
              <Input placeholder="输入引人注目的标题..." />
            </Form.Item>

            <Form.Item
              label="通知内容"
              name="content"
              rules={[
                { required: true, message: '请输入通知内容' },
                { max: 1000, message: '内容不能超过1000个字符' },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="详细描述通知内容，让用户清楚了解重要信息..."
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setNotificationModalOpen(false);
                    notificationForm.resetFields();
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={notificationLoading}
                  icon={<SendOutlined />}
                >
                  {notificationLoading ? '发送中...' : '发送通知'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
};

export default MainLayout;
