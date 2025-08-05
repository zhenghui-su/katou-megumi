import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Pagination,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  ArrowBack,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../utils/api';

interface PendingImage {
  id: number;
  filename: string;
  originalFilename: string;
  category: string;
  status: string;
  uploadedAt: string;
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

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const Review: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PendingImage | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    action: 'approve',
    title: '',
    description: '',
    category: 'official',
    reason: '',
  });
  const [message, setMessage] = useState<Message | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const statusMap = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
  };

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/');
      return;
    }

    fetchImages();
  }, [navigate, tabValue, page, categoryFilter]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const status = statusMap[tabValue as keyof typeof statusMap];
      const response = await reviewAPI.getPendingImages({
        status,
        page,
        limit: 12,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });

      setImages(response.data.data.images);
      setTotalPages(response.data.data.totalPages);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || '获取图片列表失败',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedImage) return;

    try {
      const response = await reviewAPI.approveImage(
        selectedImage.id,
        reviewForm,
      );

      setMessage({
        type: 'success',
        text: response.data.message,
      });
      setReviewDialogOpen(false);
      fetchImages(); // 刷新列表
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || '审核失败',
      });
    }
  };

  const openReviewDialog = (
    image: PendingImage,
    action: 'approve' | 'reject',
  ) => {
    setSelectedImage(image);
    setReviewForm({
      action,
      title: image.originalFilename.replace(/\.[^/.]+$/, ''),
      description: '',
      category: image.category || 'official',
      reason: '',
    });
    setReviewDialogOpen(true);
  };

  const openPreviewDialog = (image: PendingImage) => {
    setSelectedImage(image);
    setPreviewDialogOpen(true);
  };

  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      official: '官方图片',
      anime: '动漫截图',
      wallpaper: '精美壁纸',
      fanart: '同人作品',
    };
    return categoryMap[category] || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 顶部导航栏 */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            图片审核管理
          </Typography>
          <IconButton color="inherit" onClick={fetchImages}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 消息提示 */}
        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* 状态选项卡 */}
        <Paper 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(_e, newValue) => {
              setTabValue(newValue);
              setPage(1);
            }}
            centered
          >
            <Tab label="待审核" />
            <Tab label="已通过" />
            <Tab label="已拒绝" />
          </Tabs>
        </Paper>

        {/* 类别筛选器 */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
          }}
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>按类别筛选</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              label="按类别筛选"
            >
              <MenuItem value="all">全部类别</MenuItem>
              <MenuItem value="official">官方图片</MenuItem>
              <MenuItem value="anime">动漫截图</MenuItem>
              <MenuItem value="wallpaper">精美壁纸</MenuItem>
              <MenuItem value="fanart">同人作品</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* 图片列表 */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Typography align="center">加载中...</Typography>
          ) : images.length === 0 ? (
            <Typography align="center" color="text.secondary">
              暂无待审核图片
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
              }}
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.url}
                      alt={image.originalFilename}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {image.originalFilename}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={getCategoryText(image.category)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={getStatusText(image.status)}
                          size="small"
                          color={getStatusColor(image.status) as any}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        上传时间: {new Date(image.uploadedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => openPreviewDialog(image)}
                      >
                        预览
                      </Button>
                      {image.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => openReviewDialog(image, 'approve')}
                            sx={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669, #047857)',
                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.6)',
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            通过
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => openReviewDialog(image, 'reject')}
                            sx={{
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              '&:hover': {
                                borderColor: '#dc2626',
                                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            拒绝
                          </Button>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </motion.div>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* 已通过的图片列表 */}
          {loading ? (
            <Typography align="center">加载中...</Typography>
          ) : images.length === 0 ? (
            <Typography align="center" color="text.secondary">
              暂无已通过图片
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
              }}
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.url}
                      alt={image.originalFilename}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {image.originalFilename}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={getCategoryText(image.category)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={getStatusText(image.status)}
                          size="small"
                          color={getStatusColor(image.status) as any}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        上传时间: {new Date(image.uploadedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => openPreviewDialog(image)}
                      >
                        预览
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* 已拒绝的图片列表 */}
          {loading ? (
            <Typography align="center">加载中...</Typography>
          ) : images.length === 0 ? (
            <Typography align="center" color="text.secondary">
              暂无已拒绝图片
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
              }}
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.url}
                      alt={image.originalFilename}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {image.originalFilename}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={getCategoryText(image.category)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={getStatusText(image.status)}
                          size="small"
                          color={getStatusColor(image.status) as any}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        上传时间: {new Date(image.uploadedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => openPreviewDialog(image)}
                      >
                        预览
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* 分页 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Container>

      {/* 审核对话框 */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewForm.action === 'approve' ? '审核通过' : '审核拒绝'}
        </DialogTitle>
        <DialogContent>
          {reviewForm.action === 'approve' ? (
            <>
              <TextField
                fullWidth
                label="图片标题"
                value={reviewForm.title}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, title: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="图片描述"
                value={reviewForm.description}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    description: e.target.value,
                  })
                }
                multiline
                rows={3}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>分类</InputLabel>
                <Select
                  value={reviewForm.category}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, category: e.target.value })
                  }
                >
                  <MenuItem value="official">官方图片</MenuItem>
                  <MenuItem value="anime">动漫截图</MenuItem>
                  <MenuItem value="wallpaper">精美壁纸</MenuItem>
                  <MenuItem value="fanart">同人作品</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : (
            <TextField
              fullWidth
              label="拒绝原因"
              value={reviewForm.reason}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, reason: e.target.value })
              }
              multiline
              rows={4}
              margin="normal"
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleReview}
            variant="contained"
            color={reviewForm.action === 'approve' ? 'success' : 'error'}
          >
            确认{reviewForm.action === 'approve' ? '通过' : '拒绝'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>图片预览</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={selectedImage.url}
                alt={selectedImage.originalFilename}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {selectedImage.originalFilename}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                分类: {getCategoryText(selectedImage.category)} | 状态:{' '}
                {getStatusText(selectedImage.status)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Review;
