import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Tag,
  Modal,
  Input,
  Select,
  Form,
  message,
  Pagination,
  Tabs,
  Space,
  Row,
  Col,
  Image,
  Badge,
  Tooltip,
  Empty,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { reviewAPI } from '../utils/api';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface PendingImage {
  id: number;
  filename: string;
  originalFilename: string;
  category: string;
  status: string;
  reviewedAt: string;
  createdAt: string;
  url: string;
  userId: number;
}

interface ReviewForm {
  action: 'approve' | 'reject';
  title: string;
  description: string;
  category: string;
  reason: string;
}

const Review: React.FC = () => {
  const [images, setImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<PendingImage | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    action: 'approve',
    title: '',
    description: '',
    category: '',
    reason: '',
  });

  useEffect(() => {
    fetchImages();
  }, [tabValue, page, categoryFilter]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await reviewAPI.getPendingImages({
        status: tabValue,
        page,
        limit: 12,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
      });
      setImages(response.data.data?.images || []);
      setTotalPages(response.data.data?.totalPages || 1);
    } catch (error) {
      message.error('获取图片列表失败');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedImage) return;

    if (reviewForm.action === 'reject' && !reviewForm.reason.trim()) {
      message.error('请输入拒绝原因');
      return;
    }

    try {
      await reviewAPI.approveImage(selectedImage.id, {
        action: reviewForm.action,
        title: reviewForm.title,
        description: reviewForm.description,
        category: reviewForm.category,
        reason: reviewForm.reason,
      });

      message.success(
        reviewForm.action === 'approve' ? '审核通过' : '审核拒绝',
      );
      setReviewDialogOpen(false);
      fetchImages();
    } catch (error) {
      message.error('审核操作失败');
    }
  };

  const openReviewDialog = (
    image: PendingImage,
    action: 'approve' | 'reject',
  ) => {
    setSelectedImage(image);
    setReviewForm({
      action,
      title: image.originalFilename,
      description: '',
      category: image.category || 'anime',
      reason: '',
    });
    setReviewDialogOpen(true);
  };



  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      pending: { text: '待审核', color: 'orange' },
      approved: { text: '已通过', color: 'green' },
      rejected: { text: '已拒绝', color: 'red' },
    };
    return statusMap[status] || { text: '未知', color: 'default' };
  };

  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      official: '官方图片',
      anime: '动漫截图',
      wallpaper: '精美壁纸',
      fanart: '同人作品',
    };
    return categoryMap[category] || '未分类';
  };

  const getCategoryStyle = (category: string) => {
    const styleMap: { [key: string]: { background: string; color: string } } = {
      official: { background: '#dbeafe', color: '#1d4ed8' },
      anime: { background: '#fce7f3', color: '#be185d' },
      wallpaper: { background: '#d1fae5', color: '#059669' },
      fanart: { background: '#fef3c7', color: '#d97706' },
    };
    return styleMap[category] || { background: '#f3f4f6', color: '#6b7280' };
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
      }}
    >
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Tabs
          activeKey={tabValue}
          onChange={setTabValue}
          style={{ marginBottom: 16, padding: '0 24px' }}
          size="large"
          items={[
            {
              key: 'pending',
              label: (
                <Space align="center">
                  <ClockCircleOutlined style={{ color: '#f59e0b' }} />
                  <span>待审核</span>
                  <Badge
                    count={
                      images.filter((img) => img.status === 'pending').length
                    }
                    style={{ backgroundColor: '#f59e0b' }}
                  />
                </Space>
              ),
            },
            {
              key: 'approved',
              label: (
                <Space align="center">
                  <CheckCircleOutlined style={{ color: '#10b981' }} />
                  <span>已通过</span>
                  <Badge
                    count={
                      images.filter((img) => img.status === 'approved').length
                    }
                    style={{ backgroundColor: '#10b981' }}
                  />
                </Space>
              ),
            },
            {
              key: 'rejected',
              label: (
                <Space align="center">
                  <CloseCircleOutlined style={{ color: '#ef4444' }} />
                  <span>已拒绝</span>
                  <Badge
                    count={
                      images.filter((img) => img.status === 'rejected').length
                    }
                    style={{ backgroundColor: '#ef4444' }}
                  />
                </Space>
              ),
            },
          ]}
        />

        <div style={{ marginBottom: 24, padding: '0 24px' }}>
          <Space align="center">
            <FilterOutlined style={{ color: '#6366f1', fontSize: 16 }} />
            <Text strong style={{ color: '#374151' }}>
              分类筛选:
            </Text>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{
                width: 200,
                borderRadius: 12,
              }}
            >
              <Option value="all">全部分类</Option>
              <Option value="official">官方图片</Option>
              <Option value="anime">动漫截图</Option>
              <Option value="wallpaper">精美壁纸</Option>
              <Option value="fanart">同人作品</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchImages}
              loading={loading}
              style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              刷新
            </Button>
          </Space>
        </div>

        <div style={{ padding: '0 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: 40,
                  height: 40,
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>
                加载中...
              </div>
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#6b7280', fontSize: 16 }}>
                    暂无图片数据
                  </span>
                }
              />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {images.map((image) => {
                const status = getStatusText(image.status);
                return (
                  <Col xs={24} sm={12} md={8} lg={6} xl={4} key={image.id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow =
                          '0 20px 40px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      cover={
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1/1',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Image
                            src={image.url}
                            alt={image.originalFilename}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                            preview={{
                              mask: (
                                <div
                                  style={{
                                    background: 'rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    width: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                  }}
                                >
                                  <EyeOutlined
                                    style={{ fontSize: 24, color: 'white' }}
                                  />
                                </div>
                              ),
                            }}
                          />
                        </div>
                      }
                      actions={
                        tabValue === 'pending'
                          ? [
                              <Tooltip title="通过" key="approve">
                                <Button
                                  type="text"
                                  icon={<CheckCircleOutlined />}
                                  onClick={() =>
                                    openReviewDialog(image, 'approve')
                                  }
                                  style={{
                                    borderRadius: 8,
                                    color: '#10b981',
                                  }}
                                />
                              </Tooltip>,
                              <Tooltip title="拒绝" key="reject">
                                <Button
                                  type="text"
                                  icon={<CloseCircleOutlined />}
                                  onClick={() =>
                                    openReviewDialog(image, 'reject')
                                  }
                                  style={{
                                    borderRadius: 8,
                                    color: '#ef4444',
                                  }}
                                />
                              </Tooltip>,
                            ]
                          : []
                      }
                      styles={{ body: { padding: 16 } }}
                    >
                      <Card.Meta
                        title={
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: '#1f2937',
                              marginBottom: 8,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {image.originalFilename.replace(/\.[^/.]+$/, '')}
                          </div>
                        }
                        description={
                          <div style={{ padding: '8px 0' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  gap: 6,
                                  alignItems: 'center',
                                }}
                              >
                                {tabValue === 'pending' && (
                                  <Tag
                                    color={status.color}
                                    style={{
                                      borderRadius: 8,
                                      padding: '2px 6px',
                                      fontSize: 11,
                                      fontWeight: 500,
                                      margin: 0,
                                    }}
                                  >
                                    {status.text}
                                  </Tag>
                                )}
                                <Tag
                                  style={{
                                    borderRadius: 8,
                                    padding: '2px 6px',
                                    fontSize: 11,
                                    border: 'none',
                                    margin: 0,
                                    ...getCategoryStyle(image.category),
                                  }}
                                >
                                  {getCategoryText(image.category)}
                                </Tag>
                              </div>
                              <Text
                                type="secondary"
                                style={{ fontSize: 11, color: '#9ca3af' }}
                              >
                                {new Date(
                                  image.reviewedAt,
                                ).toLocaleDateString()}
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ textAlign: 'center', padding: '0 24px 24px' }}>
            <Pagination
              current={page}
              total={totalPages * 12}
              pageSize={12}
              onChange={setPage}
              showSizeChanger={false}
              style={{
                marginTop: 16,
              }}
            />
          </div>
        )}
      </Card>

      {/* 审核对话框 */}
      <Modal
        title={reviewForm.action === 'approve' ? '审核通过' : '审核拒绝'}
        open={reviewDialogOpen}
        onCancel={() => setReviewDialogOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setReviewDialogOpen(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger={reviewForm.action === 'reject'}
            onClick={handleReview}
          >
            确认{reviewForm.action === 'approve' ? '通过' : '拒绝'}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          {reviewForm.action === 'approve' ? (
            <>
              <Form.Item label="图片标题">
                <Input
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, title: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item label="图片描述">
                <TextArea
                  value={reviewForm.description}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </Form.Item>
              <Form.Item label="分类">
                <Select
                  value={reviewForm.category}
                  onChange={(value) =>
                    setReviewForm({ ...reviewForm, category: value })
                  }
                >
                  <Option value="official">官方图片</Option>
                  <Option value="anime">动漫截图</Option>
                  <Option value="wallpaper">精美壁纸</Option>
                  <Option value="fanart">同人作品</Option>
                </Select>
              </Form.Item>
            </>
          ) : (
            <Form.Item label="拒绝原因" required>
              <TextArea
                value={reviewForm.reason}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, reason: e.target.value })
                }
                rows={4}
                placeholder="请输入拒绝原因"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>


    </div>
  );
};

export default Review;
