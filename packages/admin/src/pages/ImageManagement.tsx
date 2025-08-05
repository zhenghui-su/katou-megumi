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
  Image,
  Popconfirm,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

interface ImageRecord {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  size: number;
  format: string;
  uploadTime: string;
  status: 'active' | 'inactive';
  category: string;
}

const ImageManagement: React.FC = () => {
  const [data, setData] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ImageRecord | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [searchForm] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    const mockData: ImageRecord[] = [
      {
        id: '1',
        title: '风景图片1',
        url: 'https://picsum.photos/400/300?random=1',
        description: '美丽的自然风景',
        tags: ['风景', '自然'],
        size: 1024000,
        format: 'JPG',
        uploadTime: '2024-01-15 10:30:00',
        status: 'active',
        category: '风景',
      },
      {
        id: '2',
        title: '人物照片1',
        url: 'https://picsum.photos/400/300?random=2',
        description: '人物肖像照片',
        tags: ['人物', '肖像'],
        size: 2048000,
        format: 'PNG',
        uploadTime: '2024-01-14 15:20:00',
        status: 'active',
        category: '人物',
      },
      {
        id: '3',
        title: '建筑图片1',
        url: 'https://picsum.photos/400/300?random=3',
        description: '现代建筑摄影',
        tags: ['建筑', '现代'],
        size: 1536000,
        format: 'JPG',
        uploadTime: '2024-01-13 09:15:00',
        status: 'inactive',
        category: '建筑',
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

  const handleAdd = () => {
    setEditingRecord(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (record: ImageRecord) => {
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
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handlePreview = (url: string) => {
    setPreviewImage(url);
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
        // 新增
        const newRecord: ImageRecord = {
          id: Date.now().toString(),
          url:
            fileList[0]?.url ||
            'https://picsum.photos/400/300?random=' + Date.now(),
          size: fileList[0]?.size || 1024000,
          format: fileList[0]?.type?.split('/')[1]?.toUpperCase() || 'JPG',
          uploadTime: new Date().toLocaleString('zh-CN'),
          ...values,
        };
        setData([newRecord, ...data]);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
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

  const columns: ColumnsType<ImageRecord> = [
    {
      title: '预览',
      dataIndex: 'url',
      key: 'preview',
      width: 100,
      render: (url: string) => (
        <Image
          width={60}
          height={45}
          src={url}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
          onClick={() => handlePreview(url)}
        />
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
          {tags.map((tag) => (
            <Tag key={tag} color="green" style={{ marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: 80,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size),
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
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record.url)}
            title="预览"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这张图片吗？"
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
              <Select.Option value="风景">风景</Select.Option>
              <Select.Option value="人物">人物</Select.Option>
              <Select.Option value="建筑">建筑</Select.Option>
              <Select.Option value="动物">动物</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
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
            添加图片
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
        title={editingRecord ? '编辑图片' : '添加图片'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingRecord && (
            <Form.Item
              label="上传图片"
              name="file"
              rules={[{ required: true, message: '请上传图片' }]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          )}

          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入图片标题" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Select.Option value="风景">风景</Select.Option>
              <Select.Option value="人物">人物</Select.Option>
              <Select.Option value="建筑">建筑</Select.Option>
              <Select.Option value="动物">动物</Select.Option>
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
            <Input.TextArea rows={3} placeholder="请输入图片描述" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setFileList([]);
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

      {/* 图片预览 */}
      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img
          alt="preview"
          style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default ImageManagement;
