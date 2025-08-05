import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Select,
  Progress,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

interface VideoRecord {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  description?: string;
  tags: string[];
  duration: number; // 秒
  size: number;
  format: string;
  resolution: string;
  uploadTime: string;
  status: 'active' | 'inactive' | 'processing';
  category: string;
  views: number;
}

const VideoManagement: React.FC = () => {
  const [data, setData] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VideoRecord | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewVideo, setPreviewVideo] = useState('');
  const [searchForm] = Form.useForm();
  const [uploadProgress, setUploadProgress] = useState(0);

  // 模拟数据
  useEffect(() => {
    const mockData: VideoRecord[] = [
      {
        id: '1',
        title: '自然风光纪录片',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://picsum.photos/320/180?random=1',
        description: '展现大自然的美丽风光',
        tags: ['纪录片', '自然', '风光'],
        duration: 300, // 5分钟
        size: 52428800, // 50MB
        format: 'MP4',
        resolution: '1920x1080',
        uploadTime: '2024-01-15 10:30:00',
        status: 'active',
        category: '纪录片',
        views: 1250,
      },
      {
        id: '2',
        title: '产品介绍视频',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        thumbnail: 'https://picsum.photos/320/180?random=2',
        description: '新产品功能介绍',
        tags: ['产品', '介绍', '营销'],
        duration: 180, // 3分钟
        size: 31457280, // 30MB
        format: 'MP4',
        resolution: '1280x720',
        uploadTime: '2024-01-14 15:20:00',
        status: 'active',
        category: '营销',
        views: 890,
      },
      {
        id: '3',
        title: '教学视频',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
        thumbnail: 'https://picsum.photos/320/180?random=3',
        description: '在线教学课程',
        tags: ['教学', '课程', '在线'],
        duration: 600, // 10分钟
        size: 104857600, // 100MB
        format: 'MP4',
        resolution: '1920x1080',
        uploadTime: '2024-01-13 09:15:00',
        status: 'processing',
        category: '教育',
        views: 2340,
      },
    ];
    setData(mockData);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
    setUploadProgress(0);
  };

  const handleEdit = (record: VideoRecord) => {
    setEditingRecord(record);
    setModalVisible(true);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      tags: record.tags,
      category: record.category,
      status: record.status,
    });
    setFileList([]);
    setUploadProgress(0);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handlePreview = (url: string) => {
    setPreviewVideo(url);
    setPreviewVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (editingRecord) {
        // 编辑
        const updatedData = data.map((item) =>
          item.id === editingRecord.id ? { ...item, ...values } : item,
        );
        setData(updatedData);
        message.success('更新成功');
      } else {
        // 新增 - 模拟上传进度
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 200);

        // 等待上传完成
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const newRecord: VideoRecord = {
          id: Date.now().toString(),
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          thumbnail: 'https://picsum.photos/320/180?random=' + Date.now(),
          duration: 240,
          size: fileList[0]?.size || 20971520,
          format: fileList[0]?.type?.split('/')[1]?.toUpperCase() || 'MP4',
          resolution: '1920x1080',
          uploadTime: new Date().toLocaleString('zh-CN'),
          views: 0,
          ...values,
        };
        setData([newRecord, ...data]);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      setUploadProgress(0);
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    // 这里可以实现搜索逻辑
    console.log('搜索条件:', values);
    message.info('搜索功能开发中...');
  };

  const columns: ColumnsType<VideoRecord> = [
    {
      title: '缩略图',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 120,
      render: (thumbnail: string, record) => (
        <div
          style={{
            position: 'relative',
            width: 80,
            height: 45,
            borderRadius: 4,
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => handlePreview(record.url)}
        >
          <img
            src={thumbnail}
            alt={record.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: 16,
              textShadow: '0 0 4px rgba(0,0,0,0.8)',
            }}
          >
            <PlayCircleOutlined />
          </div>
        </div>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <>
          {tags.slice(0, 2).map((tag) => (
            <Tag key={tag} color="green" style={{ marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tooltip title={tags.slice(2).join(', ')}>
              <Tag color="default">+{tags.length - 2}</Tag>
            </Tooltip>
          )}
        </>
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
      title: '分辨率',
      dataIndex: 'resolution',
      key: 'resolution',
      width: 100,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '观看次数',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', text: '正常' },
          inactive: { color: 'red', text: '禁用' },
          processing: { color: 'orange', text: '处理中' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePreview(record.url)}
            title="播放"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这个视频吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 搜索区域 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="title">
            <Input placeholder="搜索标题" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="category">
            <Select placeholder="选择分类" style={{ width: 120 }} allowClear>
              <Select.Option value="纪录片">纪录片</Select.Option>
              <Select.Option value="营销">营销</Select.Option>
              <Select.Option value="教育">教育</Select.Option>
              <Select.Option value="娱乐">娱乐</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
        </Form>

        {/* 操作按钮 */}
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加视频
          </Button>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 添加/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑视频' : '添加视频'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
          setUploadProgress(0);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingRecord && (
            <Form.Item
              label="上传视频"
              name="file"
              rules={[{ required: true, message: '请上传视频' }]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                accept="video/*"
                maxCount={1}
              >
                {fileList.length === 0 && (
                  <div>
                    <VideoCameraOutlined />
                    <div style={{ marginTop: 8 }}>上传视频</div>
                  </div>
                )}
              </Upload>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress
                  percent={uploadProgress}
                  status="active"
                  style={{ marginTop: 8 }}
                />
              )}
            </Form.Item>
          )}

          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入视频标题" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Select.Option value="纪录片">纪录片</Select.Option>
              <Select.Option value="营销">营销</Select.Option>
              <Select.Option value="教育">教育</Select.Option>
              <Select.Option value="娱乐">娱乐</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Select
              mode="tags"
              placeholder="请输入标签，按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入视频描述" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                  setUploadProgress(0);
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 视频预览 */}
      <Modal
        open={previewVisible}
        title="视频预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <video
          controls
          style={{ width: '100%', maxHeight: '70vh' }}
          src={previewVideo}
        >
          您的浏览器不支持视频播放。
        </video>
      </Modal>
    </div>
  );
};

export default VideoManagement;
