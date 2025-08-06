import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { Image } from 'antd';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FileUpload } from '@katou-megumi/shared';
import { galleryAPI } from '../utils/api';
import { useSearchParams } from 'react-router-dom';

interface UploadedFile {
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
}

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  tags?: string[];
  views: number;
  likes: number;
  createdAt: string;
  uploadedBy?: string;
}

interface CategoryInfo {
  key: string;
  label: string;
  color: string;
}

const Gallery: React.FC = () => {
  const { isAuthenticated, token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 分类配置
  const categories: CategoryInfo[] = [
    { key: 'all', label: '全部', color: '#ff6b9d' },
    { key: 'official', label: '官方图片', color: '#ff6b9d' },
    { key: 'anime', label: '动漫截图', color: '#4a90e2' },
    { key: 'wallpaper', label: '精美壁纸', color: '#7b68ee' },
    { key: 'fanart', label: '同人作品', color: '#ff7043' },
  ];

  // 去除文件扩展名的函数
  const removeFileExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename;
    return filename.substring(0, lastDotIndex);
  };

  // 获取已通过审核的图片
  const fetchImages = async (category?: string) => {
    try {
      setLoading(true);
      let response;
      if (category && category !== 'all') {
        // 使用分类专用接口
        response = await galleryAPI.getImagesByCategory(category);
      } else {
        // 获取所有图片
        response = await galleryAPI.getImages();
      }
      if (response.data.success) {
        // 处理不同接口返回的数据结构
        const imageData =
          response.data.data?.images || response.data.data || [];
        setImages(imageData);
      }
    } catch (error) {
      console.error('获取图片错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取图片和处理URL参数
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'all';
    setSelectedCategory(categoryFromUrl);
    fetchImages(categoryFromUrl);
  }, [searchParams]);

  // 处理分类切换
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
    fetchImages(category);
  };

  const handleUploadSuccess = (files: UploadedFile[]) => {
    setMessage({
      type: 'info',
      text: `成功上传 ${files.length} 个文件！图片已提交审核，审核通过后将显示在画廊中。`,
    });
    setTimeout(() => setMessage(null), 5000);
    setUploadDialogOpen(false);
    // 上传成功后可以选择刷新图片列表（如果需要显示最新审核通过的图片）
    // fetchImages();
  };

  const handleUploadError = (error: string) => {
    setMessage({
      type: 'error',
      text: `上传失败: ${error}`,
    });
    setTimeout(() => setMessage(null), 5000);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography variant="h2" component="h1" align="center" sx={{ mb: 2 }}>
          加藤惠画廊
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          收录加藤惠的精美图片集合
        </Typography>

        {/* 分类筛选 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category.key}
              label={category.label}
              clickable
              variant={
                selectedCategory === category.key ? 'filled' : 'outlined'
              }
              onClick={() => handleCategoryChange(category.key)}
              sx={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                px: 2,
                py: 0.5,
                backgroundColor:
                  selectedCategory === category.key
                    ? category.color
                    : 'transparent',
                color:
                  selectedCategory === category.key ? 'white' : category.color,
                borderColor: category.color,
                borderWidth: 2,
                '&:hover': {
                  backgroundColor: category.color,
                  color: 'white',
                  transform: 'scale(1.05)',
                  boxShadow: `0 4px 15px ${category.color}40`,
                },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
      </motion.div>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            加载中...
          </Typography>
        </Box>
      ) : images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            暂无图片，快来上传第一张图片吧！
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 3,
            mt: 2,
          }}
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Tooltip
                  title={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', mb: 1 }}
                      >
                        {removeFileExtension(image.title)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        上传时间: {formatDate(image.createdAt)}
                      </Typography>
                      {image.uploadedBy && (
                        <Typography variant="body2">
                          上传人: {image.uploadedBy}
                        </Typography>
                      )}
                    </Box>
                  }
                  placement="top"
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    style={{
                      width: '100%',
                      height: '280px',
                      objectFit: 'cover',
                      flex: 1,
                      display: 'block',
                    }}
                    preview={{
                      mask: (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                          }}
                        >
                          点击预览
                        </Box>
                      ),
                    }}
                  />
                </Tooltip>
              </Box>
            </motion.div>
          ))}
        </Box>
      )}

      {/* 消息提示 */}
      {message && (
        <Alert
          severity={message.type}
          sx={{ mt: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          更多精美图片正在整理中，敬请期待...
        </Typography>
      </Box>

      {/* 浮动上传按钮 - 只对版主和管理员显示 */}
      {isAuthenticated &&
        (user?.role === 'admin' || user?.role === 'moderator') && (
          <Fab
            color="primary"
            aria-label="upload"
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 32,
              left: 32,
              zIndex: 1000,
              backgroundColor: '#ff6b9d',
              '&:hover': {
                backgroundColor: '#ff4081',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Add />
          </Fab>
        )}

      {/* 上传弹窗 */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              maxHeight: '70vh',
              overflow: 'auto',
              m: 2,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography>上传图片</Typography>
          <IconButton onClick={() => setUploadDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            上传的图片将提交给管理员审核，审核通过后会显示在画廊中
          </Typography>
          <FileUpload
            multiple={true}
            acceptedTypes={['image/*']}
            maxFileSize={5 * 1024 * 1024} // 5MB
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            authToken={token || undefined}
            apiUrl="http://localhost:8080/api/upload"
            showCategorySelect={true}
            defaultCategory="fanart"
            maxFiles={10}
            width="100%"
            height={400}
            previewImageHeight={120}
            showFileInfo={true}
            showFileExtension={false}
            customDeleteIcon={<Close fontSize="small" />}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Gallery;
