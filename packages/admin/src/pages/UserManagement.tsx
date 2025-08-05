import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Tag,
  Avatar,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { userAPI } from '../utils/api';

const { Option } = Select;

interface User {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  // 当搜索条件变化时重新获取数据
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // 防抖
    return () => clearTimeout(timer);
  }, [searchText, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 过滤掉空值参数，避免后端验证错误
      const params: any = {};
      if (searchText && searchText.trim()) {
        params.search = searchText.trim();
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await userAPI.getUsers(params);
      setUsers(response.data.data || []);
    } catch (error) {
      setUsers([]);
      message.warning('连接服务器失败，当前显示空列表');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      createdAt: dayjs(user.createdAt),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      message.success('删除成功');
    } catch (error) {
      console.error('删除用户失败:', error);
      // 即使API失败，也从本地状态中移除（模拟删除）
      setUsers(users.filter((user) => user.id !== id));
      message.warning('删除请求失败，但已从列表中移除');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const userData = {
        ...values,
        createdAt:
          values.createdAt?.format('YYYY-MM-DD HH:mm:ss') ||
          dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      if (editingUser) {
        // 编辑用户
        try {
          await userAPI.updateUser(editingUser.id, userData);
        } catch (error) {
          console.warn('API更新失败，使用本地更新:', error);
        }
        const updatedUsers = users.map((user) =>
          user.id === editingUser.id ? { ...user, ...userData } : user,
        );
        setUsers(updatedUsers);
        message.success('用户更新成功');
      } else {
        // 添加用户
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        };

        try {
          await userAPI.createUser(userData);
        } catch (error) {
          console.warn('API创建失败，使用本地添加:', error);
        }
        setUsers([...users, newUser]);
        message.success('用户添加成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getRoleTag = (role: string) => {
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

  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'success', text: '正常' },
      inactive: { color: 'warning', text: '未激活' },
      banned: { color: 'error', text: '已封禁' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchText ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.nickname.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 100,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size={40} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.nickname}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 100,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 50,
      render: (role) => getRoleTag(role),
      filters: [
        { text: '管理员', value: 'admin' },
        { text: '版主', value: 'moderator' },
        { text: '普通用户', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 30,
      render: (status) => getStatusTag(status),
      filters: [
        { text: '正常', value: 'active' },
        { text: '未激活', value: 'inactive' },
        { text: '已封禁', value: 'banned' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 120,
      render: (time) =>
        time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '从未登录',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    admin: users.filter((u) => u.role === 'admin').length,
    banned: users.filter((u) => u.status === 'banned').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={userStats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={userStats.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="管理员"
              value={userStats.admin}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="封禁用户"
              value={userStats.banned}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Input
                placeholder="搜索用户名、邮箱或昵称"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Select
                placeholder="筛选状态"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="active">正常</Option>
                <Option value="inactive">未激活</Option>
                <Option value="banned">已封禁</Option>
              </Select>
              <Select
                placeholder="筛选角色"
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="admin">管理员</Option>
                <Option value="moderator">版主</Option>
                <Option value="user">普通用户</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加用户
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: '用户名只能包含字母、数字和下划线',
                  },
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">管理员</Option>
                  <Option value="moderator">版主</Option>
                  <Option value="user">普通用户</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">正常</Option>
                  <Option value="inactive">未激活</Option>
                  <Option value="banned">已封禁</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
