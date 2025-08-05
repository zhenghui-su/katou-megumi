import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface MusicItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  url: string;
  coverUrl?: string;
  size: number;
  uploadTime: string;
  status: 'active' | 'inactive';
}

const MusicManagement: React.FC = () => {
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMusic, setEditingMusic] = useState<MusicItem | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetchMusicList();
  }, []);

  const fetchMusicList = async () => {
    setLoading(true);
    try {
      // 模拟API调用，实际项目中应该从后端获取
      const mockData: MusicItem[] = [
        {
          id: '1',
          title: '夜に駆ける',
          artist: 'YOASOBI',
          album: 'THE BOOK',
          duration: 239,
          url: 'https://example.com/music1.mp3',
          coverUrl: 'https://example.com/cover1.jpg',
          size: 5.8 * 1024 * 1024,
          uploadTime: '2024-01-15 10:30:00',
          status: 'active',
        },
        {
          id: '2',
          title: '群青',
          artist: 'YOASOBI',
          album: 'THE BOOK 2',
          duration: 201,
          url: 'https://example.com/music2.mp3',
          coverUrl: 'https://example.com/cover2.jpg',
          size: 4.9 * 1024 * 1024,
          uploadTime: '2024-01-14 15:20:00',
          status: 'active',
        },
      ];
      setMusicList(mockData);
    } catch (error) {
      message.error('获取音乐列表失败');
      console.error('获取音乐列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMusic(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (record: MusicItem) => {
    setEditingMusic(record);
    setModalVisible(true);
    form.setFieldsValue({
      title: record.title,
      artist: record.artist,
      album: record.album,
    });
    setFileList([]);
  };

  const handleDelete = async (id: string) => {
    try {
      // 实际项目中应该调用删除API
      setMusicList(prev => prev.filter(item => item.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMusic) {
        // 编辑模式
        setMusicList(prev => prev.map(item => 
          item.id === editingMusic.id 
            ? { ...item, ...values }
            : item
        ));
        message.success('更新成功');
      } else {
        // 新增模式
        if (fileList.length === 0) {
          message.error('请选择音乐文件');
          return;
        }
        
        const newMusic: MusicItem = {
          id: Date.now().toString(),
          ...values,
          duration: 180, // 模拟时长
          url: 'https://example.com/new-music.mp3',
          size: 5 * 1024 * 1024, // 模拟文件大小
          uploadTime: new Date().toLocaleString(),
          status: 'active',
        };
        
        setMusicList(prev => [newMusic, ...prev]);
        message.success('添加成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const handlePlay = (id: string) => {
    if (currentPlaying === id) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying(id);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const columns: ColumnsType<MusicItem> = [
    {
      title: '音乐信息',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.title}
          </div>
          <div style={{ color: '#666', fontSize: 12 }}>
            {record.artist} {record.album && `• ${record.album}`}
          </div>
        </div>
      ),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration: number) => formatDuration(duration),
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={currentPlaying === record.id ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handlePlay(record.id)}
            style={{ color: '#1890ff' }}
          >
            {currentPlaying === record.id ? '暂停' : '播放'}
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这首音乐吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    fileList,
    beforeUpload: (file: File) => {
      const isAudio = file.type.startsWith('audio/');
      if (!isAudio) {
        message.error('只能上传音频文件！');
        return false;
      }
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('音频文件大小不能超过 50MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList.slice(-1)); // 只保留最后一个文件
    },
  };

  const stats = {
    total: musicList.length,
    active: musicList.filter(item => item.status === 'active').length,
    totalSize: musicList.reduce((sum, item) => sum + item.size, 0),
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总音乐数"
              value={stats.total}
              prefix={<SoundOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用中"
              value={stats.active}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总存储"
              value={formatFileSize(stats.totalSize)}
              prefix={<CloudUploadOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均大小"
              value={stats.total > 0 ? formatFileSize(stats.totalSize / stats.total) : '0 MB'}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            音乐管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加音乐
          </Button>
        </div>
        
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          管理 shared 音乐播放器的音乐列表，支持上传到云对象存储 COS
        </Text>

        <Table
          columns={columns}
          dataSource={musicList}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 首音乐`,
          }}
        />
      </Card>

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingMusic ? '编辑音乐' : '添加音乐'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          {!editingMusic && (
            <Form.Item
              label="音乐文件"
              required
            >
              <Upload
                {...uploadProps}
                listType="text"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>
                  选择音频文件
                </Button>
              </Upload>
              <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                支持 MP3、WAV、FLAC 等格式，文件大小不超过 50MB
              </div>
            </Form.Item>
          )}
          
          <Form.Item
            name="title"
            label="音乐标题"
            rules={[{ required: true, message: '请输入音乐标题' }]}
          >
            <Input placeholder="请输入音乐标题" />
          </Form.Item>
          
          <Form.Item
            name="artist"
            label="艺术家"
            rules={[{ required: true, message: '请输入艺术家' }]}
          >
            <Input placeholder="请输入艺术家" />
          </Form.Item>
          
          <Form.Item
            name="album"
            label="专辑"
          >
            <Input placeholder="请输入专辑名称（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MusicManagement;