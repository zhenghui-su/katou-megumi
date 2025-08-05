import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Send, Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { notificationAPI } from '../utils/api';

interface Message {
  type: 'success' | 'error';
  text: string;
}

const SystemNotification: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: '标题和内容不能为空' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await notificationAPI.createSystemNotification({ title, content });
      const data = response.data;

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        // 清空表单
        setTitle('');
        setContent('');
      } else {
        setMessage({ type: 'error', text: data.message || '发送失败' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || '网络错误，请稍后重试' 
      });
    } finally {
      setLoading(false);
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
            系统通知管理
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
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

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* 发送通知表单 */}
          <Box sx={{ flex: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card 
                sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      <Send sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
                      发送系统通知
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                      向所有用户发送重要的系统通知
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                    <TextField
                      fullWidth
                      label="通知标题"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      margin="normal"
                      required
                      autoFocus
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="通知内容"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      multiline
                      rows={5}
                      margin="normal"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      startIcon={<Send />}
                      sx={{ 
                        mt: 4, 
                        py: 1.8,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
                        },
                      }}
                    >
                      {loading ? '发送中...' : '发送通知'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* 通知说明 */}
          <Box sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Notifications color="primary" />
                    关于系统通知
                  </Typography>
                  <Typography variant="body2" paragraph>
                    系统通知将发送给所有注册用户，并在用户登录后显示在通知中心。
                  </Typography>
                  <Typography variant="body2" paragraph>
                    请确保通知内容简洁明了，避免发送过于频繁的通知打扰用户。
                  </Typography>
                  <Typography variant="body2" paragraph>
                    系统通知适用于：
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body2">网站维护公告</Typography>
                    </li>
                    <li>
                      <Typography variant="body2">功能更新通知</Typography>
                    </li>
                    <li>
                      <Typography variant="body2">重要活动提醒</Typography>
                    </li>
                    <li>
                      <Typography variant="body2">系统规则变更</Typography>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SystemNotification;
