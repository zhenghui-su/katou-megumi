import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
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

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

const SystemNotification: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: '请填写标题和内容' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:8080/api/notifications/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message });
        setTitle('');
        setContent('');
      } else {
        setMessage({ type: 'error', text: data.message || '发送失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 顶部导航栏 */}
      <AppBar position='static' sx={{ backgroundColor: '#ff6b9d' }}>
        <Toolbar>
          <IconButton
            color='inherit'
            onClick={() => navigate('/management/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            系统通知管理
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth='md' sx={{ py: 4 }}>
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

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* 发送通知表单 */}
          <Box sx={{ flex: 2 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Send color='primary' />
                  发送系统通知
                </Typography>
                
                <Box component='form' onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label='通知标题'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 3 }}
                    placeholder='请输入通知标题'
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label='通知内容'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    rows={6}
                    sx={{ mb: 3 }}
                    placeholder='请输入通知内容，支持换行...'
                    required
                  />
                  
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    disabled={loading}
                    startIcon={<Send />}
                    sx={{
                      backgroundColor: '#ff6b9d',
                      '&:hover': {
                        backgroundColor: '#e91e63',
                      },
                    }}
                  >
                    {loading ? '发送中...' : '发送给所有用户'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* 使用说明 */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Notifications color='info' />
                  使用说明
                </Typography>
                
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  系统通知将发送给所有已注册的活跃用户，用户可以在网站右上角的通知图标中查看。
                </Typography>
                
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>注意事项：</strong>
                </Typography>
                
                <Box component='ul' sx={{ pl: 2, m: 0 }}>
                  <Typography component='li' variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                    通知标题建议控制在20字以内
                  </Typography>
                  <Typography component='li' variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                    通知内容建议控制在200字以内
                  </Typography>
                  <Typography component='li' variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                    发送后无法撤回，请谨慎操作
                  </Typography>
                  <Typography component='li' variant='body2' color='text.secondary'>
                    用户可以删除或标记为已读
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            {/* 通知类型说明 */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  通知类型
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    🔔 系统通知
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                    管理员发送的系统公告
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    ✅ 审核通知
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                    图片审核结果通知
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#0288d1' }}>
                    👤 用户通知
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                    用户间的互动通知
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SystemNotification;