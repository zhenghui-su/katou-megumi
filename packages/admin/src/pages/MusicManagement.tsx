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
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { musicAPI, uploadAPI } from '../utils/api';

const { Title, Text } = Typography;

interface MusicItem {
  id: number;
  title: string;
  artist: string;
  src: string;
  duration: number;
  cover?: string;
  category: string;
  description?: string;
  playCount: number;
  createdAt: string;
  updatedAt: string;
}

const MusicManagement: React.FC = () => {
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMusic, setEditingMusic] = useState<MusicItem | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [coverFileList, setCoverFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMusicList();
  }, []);

  const fetchMusicList = async () => {
    setLoading(true);
    try {
      const response = await musicAPI.getMusic();
      const musicData = response.data.data || response.data || [];
      setMusicList(musicData);
    } catch (error) {
      message.error('获取音乐列表失败');
      console.error('获取音乐列表失败:', error);

      setMusicList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMusic(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
    setCoverFileList([]);
  };

  const handleEdit = (record: MusicItem) => {
    setEditingMusic(record);
    setModalVisible(true);
    form.setFieldsValue({
      title: record.title,
      artist: record.artist,
      category: record.category,
    });
    setFileList([]);

    // 回显现有封面
    if (record.cover) {
      setCoverFileList([
        {
          uid: '-1',
          name: 'cover.jpg',
          status: 'done',
          url: record.cover,
        },
      ]);
    } else {
      setCoverFileList([]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await musicAPI.deleteMusic(id);
      // 删除成功后重新获取音乐列表，确保数据同步
      await fetchMusicList();
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    }
  };

  const handleSubmit = async () => {
    if (submitting) {
      return; // 防止重复提交
    }
    
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (editingMusic) {
        // 编辑模式
        let updateData = { ...values };

        // 处理封面更新
        if (coverFileList.length > 0) {
          const currentCover = coverFileList[0];

          // 如果是新上传的文件（有originFileObj）
          if (currentCover.originFileObj) {
            try {
              // 上传新封面
              const coverFormData = new FormData();
              coverFormData.append('file', currentCover.originFileObj as File);
              const coverUploadResponse =
                await uploadAPI.uploadPublicSingle(coverFormData);
              const coverUploadData =
                coverUploadResponse.data.data || coverUploadResponse.data;
              const newCoverUrl = coverUploadData.url || coverUploadData.src;

              updateData.cover = newCoverUrl;

              // 如果之前有封面，删除旧封面
              if (editingMusic.cover && editingMusic.cover !== newCoverUrl) {
                try {
                  await musicAPI.deleteFile(editingMusic.cover);
                } catch (deleteError) {
                  console.error('删除旧封面失败:', deleteError);
                }
              }
            } catch (coverUploadError) {
              message.error('封面上传失败');
              console.error('封面上传失败:', coverUploadError);
              return;
            }
          } else if (currentCover.url) {
            // 如果是现有的封面（只有url，没有originFileObj），保持不变
            updateData.cover = currentCover.url;
          }
        } else {
          // 如果没有封面文件，清空封面
          updateData.cover = null;

          // 如果之前有封面，删除旧封面
          if (editingMusic.cover) {
            try {
              await musicAPI.deleteFile(editingMusic.cover);
            } catch (deleteError) {
              console.warn('删除旧封面失败:', deleteError);
            }
          }
        }

        await musicAPI.updateMusic(editingMusic.id, updateData);
        setMusicList((prev) =>
          prev.map((item) =>
            item.id === editingMusic.id ? { ...item, ...updateData } : item,
          ),
        );
        message.success('更新成功');
      } else {
        // 新增模式
        if (fileList.length === 0) {
          message.error('请选择音乐文件');
          return;
        }

        // 先上传封面文件（如果有）
        let coverUrl = '';
        if (coverFileList.length > 0) {
          const coverFormData = new FormData();
          coverFormData.append(
            'file',
            coverFileList[0].originFileObj as File,
          );
          try {
            const coverUploadResponse =
              await uploadAPI.uploadPublicSingle(coverFormData);
            const coverUploadData =
              coverUploadResponse.data.data || coverUploadResponse.data;
            coverUrl = coverUploadData.url || coverUploadData.src;
          } catch (coverUploadError) {
            console.warn('封面上传失败，继续创建音乐:', coverUploadError);
          }
        }

        // 上传音乐文件并创建记录（一步完成）
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj as File);
        formData.append('title', values.title);
        formData.append('artist', values.artist);
        formData.append('category', values.category);
        formData.append('description', `${values.artist} - ${values.title}`);
        if (coverUrl) {
          formData.append('cover', coverUrl);
        }

        try {
          const uploadResponse = await musicAPI.uploadMusic(formData);
          const newMusic = uploadResponse.data.data || uploadResponse.data;

          setMusicList((prev) => [newMusic, ...prev]);
          message.success('添加成功');
        } catch (uploadError) {
          message.error('文件上传失败');
          console.error('文件上传失败:', uploadError);
          return;
        }
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      setCoverFileList([]);
    } catch (error) {
      message.error('操作失败');
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<MusicItem> = [
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 80,
      render: (cover: string) => (
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
          }}
        >
          {cover ? (
            <img
              src={cover}
              alt="封面"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ccc',
              }}
            >
              无
            </div>
          )}
        </div>
      ),
    },
    {
      title: '音乐信息',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.title}</div>
          <div style={{ color: '#666', fontSize: 12 }}>
            {record.artist} {record.category && `• ${record.category}`}
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这首音乐吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
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

  const coverUploadProps = {
    fileList: coverFileList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片文件大小不能超过 5MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setCoverFileList(newFileList.slice(-1)); // 只保留最后一个文件
    },
  };

  // 格式化时长为分秒
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 主要内容 */}
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            音乐管理
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
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
        confirmLoading={submitting}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
          setCoverFileList([]);
          setSubmitting(false);
        }}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          {!editingMusic && (
            <Form.Item label="音乐文件" required>
              <Upload {...uploadProps} listType="text" maxCount={1}>
                <Button icon={<UploadOutlined />}>选择音频文件</Button>
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

          <Form.Item label="封面图片">
            <Upload {...coverUploadProps} listType="picture-card" maxCount={1}>
              {coverFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传封面</div>
                </div>
              )}
            </Upload>
            <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
              支持 JPG、PNG 等格式，文件大小不超过 5MB
            </div>
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Input placeholder="请输入音乐分类（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MusicManagement;
