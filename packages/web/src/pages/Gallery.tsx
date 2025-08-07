import React from 'react';
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
import { useGallery } from '../hooks/useGallery';
import { categories } from '../constants/gallery';
import { removeFileExtension, formatDate } from '../utils/gallery';

const Gallery: React.FC = () => {
  const { isAuthenticated, token, user } = useAuth();
  const {
    uploadDialogOpen,
    message,
    images,
    loading,
    selectedCategory,
    setUploadDialogOpen,
    setMessage,
    handleCategoryChange,
    handleUploadSuccess,
    handleUploadError,
  } = useGallery();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
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
