import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Alert,
  Modal,
  message,
  Spin,
  Typography,
  Divider,
  Tag,
  Form,
  InputNumber,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { cleanupAPI } from '../utils/api';

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

interface CleanupStats {
  totalRejectedImages: number;
  oldRejectedImages: number;
  excessRejectedImages: number;
  maxRetainedImages: number;
  retentionDays: number;
  nextCleanupNeeded: boolean;
}

interface CleanupConfig {
  retentionDays: number;
  maxRetainedImages: number;
}

const CleanupManagement: React.FC = () => {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [config, setConfig] = useState<CleanupConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configForm] = Form.useForm();

  // 获取清理统计信息
  const fetchCleanupStats = async () => {
    setLoading(true);
    try {
      const response = await cleanupAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('获取清理统计信息失败:', error);
      message.error('获取清理统计信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取清理配置
  const fetchConfig = async () => {
    try {
      const response = await cleanupAPI.getConfig();
      setConfig(response.data.data);
      configForm.setFieldsValue(response.data.data);
    } catch (error) {
      console.error('获取清理配置失败:', error);
      message.error('获取清理配置失败');
    }
  };

  // 手动触发清理
  const handleManualCleanup = () => {
    confirm({
      title: '确认执行清理任务',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Paragraph>
            此操作将清理以下内容：
          </Paragraph>
          <ul>
            <li>超过 {stats?.retentionDays} 天的已拒绝图片</li>
            <li>超过 {stats?.maxRetainedImages} 张的已拒绝图片（保留最新的）</li>
          </ul>
          <Alert
            message="警告"
            description="清理操作不可逆，请确认后再执行。"
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: '确认清理',
      okType: 'danger',
      cancelText: '取消',
      onOk: executeCleanup,
    });
  };

  // 执行清理任务
  const executeCleanup = async () => {
    setCleanupLoading(true);
    try {
      await cleanupAPI.manualCleanup();
       message.success('清理任务执行成功');
       fetchCleanupStats();
    } catch (error) {
      console.error('清理任务执行失败:', error);
      message.error('清理任务执行失败');
    } finally {
      setCleanupLoading(false);
    }
  };

  // 更新清理配置
  const handleConfigUpdate = async (values: CleanupConfig) => {
    try {
      await cleanupAPI.updateConfig(values);
      message.success('配置更新成功');
      setConfigModalVisible(false);
      fetchConfig();
       fetchCleanupStats();
    } catch (error) {
      console.error('配置更新失败:', error);
      message.error('配置更新失败');
    }
  };

  useEffect(() => {
    fetchCleanupStats();
    fetchConfig();
  }, []);

  const getCleanupStatusColor = () => {
    if (!stats) return 'default';
    return stats.nextCleanupNeeded ? 'warning' : 'success';
  };

  const getCleanupStatusText = () => {
    if (!stats) return '未知';
    return stats.nextCleanupNeeded ? '需要清理' : '无需清理';
  };

  return (
    <div style={{ padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title level={2}>数据清理管理</Title>
        <Paragraph type="secondary">
          管理已拒绝图片的自动清理，节省存储空间并保持系统整洁。
        </Paragraph>

        <Divider />

        {/* 清理统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="已拒绝图片总数"
                value={stats?.totalRejectedImages || 0}
                prefix={<DeleteOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="过期图片数量"
                value={stats?.oldRejectedImages || 0}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
                suffix={`(>${stats?.retentionDays || 7}天)`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="超量图片数量"
                value={stats?.excessRejectedImages || 0}
                prefix={<InfoCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
                suffix={`(>${stats?.maxRetainedImages || 100}张)`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  清理状态
                </div>
                <Tag
                  color={getCleanupStatusColor()}
                  icon={stats?.nextCleanupNeeded ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                  style={{ fontSize: '16px', padding: '4px 12px' }}
                >
                  {getCleanupStatusText()}
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 清理规则说明 */}
        <Card title="清理规则" style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Alert
                message="时间清理规则"
                description={`自动清理超过 ${stats?.retentionDays || 7} 天的已拒绝图片，包括本地文件和数据库记录。`}
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </Col>
            <Col xs={24} md={12}>
              <Alert
                message="数量清理规则"
                description={`当已拒绝图片超过 ${stats?.maxRetainedImages || 100} 张时，自动清理最旧的图片，保留最新的 ${stats?.maxRetainedImages || 100} 张。`}
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </Col>
          </Row>
          <Divider />
          <Alert
            message="自动清理时间"
            description="系统每天凌晨 2:00 自动执行清理任务，无需手动干预。"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        </Card>

        {/* 操作区域 */}
        <Card title="清理操作">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Paragraph>
                <strong>手动清理：</strong>立即执行清理任务，清理过期和超量的已拒绝图片。
              </Paragraph>
              <Space>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleManualCleanup}
                  loading={cleanupLoading}
                  disabled={!stats?.nextCleanupNeeded}
                >
                  {cleanupLoading ? '清理中...' : '立即清理'}
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchCleanupStats}
                  loading={loading}
                >
                  刷新统计
                </Button>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setConfigModalVisible(true)}
                >
                  清理配置
                </Button>
              </Space>
            </div>

            {!stats?.nextCleanupNeeded && (
              <Alert
                message="当前无需清理"
                description="系统中没有需要清理的过期或超量图片。"
                type="success"
                showIcon
              />
            )}
          </Space>
        </Card>
      </motion.div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      )}

      {/* 配置模态框 */}
      <Modal
        title="清理配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleConfigUpdate}
          initialValues={config || undefined}
        >
          <Form.Item
            label="保留天数"
            name="retentionDays"
            rules={[
              { required: true, message: '请输入保留天数' },
              { type: 'number', min: 1, max: 365, message: '保留天数必须在1-365之间' },
            ]}
            extra="已拒绝图片的保留天数，超过此天数的图片将被自动清理"
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              placeholder="请输入保留天数"
              addonAfter="天"
            />
          </Form.Item>

          <Form.Item
            label="最大保留数量"
            name="maxRetainedImages"
            rules={[
              { required: true, message: '请输入最大保留数量' },
              { type: 'number', min: 10, max: 10000, message: '最大保留数量必须在10-10000之间' },
            ]}
            extra="已拒绝图片的最大保留数量，超过此数量时将清理最旧的图片"
          >
            <InputNumber
              min={10}
              max={10000}
              style={{ width: '100%' }}
              placeholder="请输入最大保留数量"
              addonAfter="张"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存配置
              </Button>
              <Button onClick={() => setConfigModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CleanupManagement;