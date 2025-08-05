import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Row,
  Col,
  Divider,
  Typography,
  Spin,
} from 'antd';
import {
  CameraOutlined,
  SaveOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadAPI, authAPI } from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { getRoleTag, getStatusTag } from '../utils/util';

// 头像上传样式
const avatarUploaderStyle = `
  .avatar-uploader .ant-upload {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px dashed #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    transition: all 0.3s;
  }
  .avatar-uploader .ant-upload:hover {
    border-color: #1890ff;
  }
  .avatar-uploader .ant-upload-select-picture-card {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
`;

const { Text } = Typography;

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { userProfile, setUserProfile, updateUserProfile } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // 初始化头像URL
  useEffect(() => {
    if (userProfile?.avatar) {
      setAvatarUrl(userProfile.avatar);
    }
  }, [userProfile]);

  // 当用户信息变化时更新表单
  useEffect(() => {
    if (userProfile) {
      form.setFieldsValue({
        username: userProfile.username,
        email: userProfile.email,
        nickname: userProfile.nickname,
      });
    }
  }, [userProfile, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const updateData = {
        ...values,
        avatar: avatarUrl,
      };
      Reflect.deleteProperty(updateData, 'username');
      // 如果没有输入新密码，则不更新密码字段
      if (!values.password) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }

      // 调用API更新用户信息
      const response = await authAPI.updateProfile(updateData);

      // 更新本地用户信息
      setUserProfile(response.data.data);
      updateUserProfile(response.data.data);

      message.success('个人资料更新成功');

      // 清空密码字段
      form.setFieldsValue({
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      message.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      setAvatarLoading(true);

      const formData = new FormData();
      formData.append('file', file as File);

      // 调用公共上传接口
      const response = await uploadAPI.uploadPublicSingle(formData);

      const uploadedUrl = response.data?.data?.url;
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        // 同时更新用户资料中的头像字段
        updateUserProfile({ avatar: uploadedUrl });
        message.success('头像上传成功');
        onSuccess?.(response.data.data);
      } else {
        throw new Error('上传响应格式错误');
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      message.error('头像上传失败，请重试');
      onError?.(error as Error);
    } finally {
      setAvatarLoading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
      return false;
    }

    return true;
  };

  if (loading && !userProfile) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <style>{avatarUploaderStyle}</style>

      <Card style={{ borderRadius: '12px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* 头像上传区域 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <Upload
              name="avatar"
              listType="picture-circle"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={handleAvatarUpload}
            >
              {avatarUrl ? (
                <Avatar
                  src={avatarUrl}
                  size={100}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <div style={{ cursor: 'pointer' }}>
                  {avatarLoading ? (
                    <LoadingOutlined style={{ fontSize: '32px' }} />
                  ) : (
                    <>
                      <CameraOutlined
                        style={{ fontSize: '32px', marginBottom: '8px' }}
                      />
                      <div>上传头像</div>
                    </>
                  )}
                </div>
              )}
            </Upload>
            <Text
              type="secondary"
              style={{
                display: 'block',
                marginTop: '8px',
                textAlign: 'center',
              }}
            >
              点击上传头像，支持 JPG、PNG 格式，大小不超过 2MB
            </Text>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* 基本信息 */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                ]}
              >
                <Input placeholder="请输入用户名" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="昵称"
                name="nickname"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Divider orientation="left" style={{ margin: '16px 0' }}>
            修改密码
          </Divider>
          <Text
            type="secondary"
            style={{ marginBottom: '16px', display: 'block' }}
          >
            如不需要修改密码，请留空以下字段
          </Text>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="新密码"
                name="password"
                rules={[{ min: 6, message: '密码至少6个字符' }]}
              >
                <Input.Password placeholder="留空则不修改密码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="确认密码"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入新密码" />
              </Form.Item>
            </Col>
          </Row>

          {/* 账户信息展示 */}
          {userProfile && (
            <>
              <Divider orientation="left" style={{ margin: '16px 0' }}>
                账户信息
              </Divider>
              <Row gutter={24}>
                <Col span={8}>
                  <Text strong>角色：</Text>
                  <Text>{getRoleTag(userProfile.role)}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>状态：</Text>
                  <Text>{getStatusTag(userProfile.status)}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>注册时间：</Text>
                  <Text>
                    {new Date(userProfile.createdAt).toLocaleDateString(
                      'zh-CN',
                    )}
                  </Text>
                </Col>
              </Row>
            </>
          )}

          {/* 提交按钮 */}
          <Form.Item
            style={{
              marginTop: '24px',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
