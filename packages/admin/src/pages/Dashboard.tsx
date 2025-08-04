import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person,
  Image,
  VideoLibrary,
  Visibility,
  RateReview,
  Notifications,
  PhotoLibrary,
  AccountCircle,
  ExitToApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminAPI, reviewAPI } from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalImages: number;
  totalVideos: number;
  totalViews: number;
}

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalImages: 0,
    totalVideos: 0,
    totalViews: 0,
  });
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('解析用户数据失败:', error);
      navigate('/');
    }

    // 获取仪表板统计数据
    fetchDashboardStats();
    fetchReviewStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await reviewAPI.getStats();
      setReviewStats(response.data.data);
    } catch (error) {
      console.error('获取审核统计失败:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/');
  };

  // 统计卡片数据
  const statCards = [
    {
      title: '用户总数',
      value: stats.totalUsers,
      icon: <Person sx={{ fontSize: 40, color: '#3f51b5' }} />,
      color: '#e8eaf6',
    },
    {
      title: '图片总数',
      value: stats.totalImages,
      icon: <Image sx={{ fontSize: 40, color: '#f50057' }} />,
      color: '#fce4ec',
    },
    {
      title: '视频总数',
      value: stats.totalVideos,
      icon: <VideoLibrary sx={{ fontSize: 40, color: '#ff9800' }} />,
      color: '#fff3e0',
    },
    {
      title: '总浏览量',
      value: stats.totalViews,
      icon: <Visibility sx={{ fontSize: 40, color: '#4caf50' }} />,
      color: '#e8f5e9',
    },
  ];

  // 审核统计卡片数据
  const reviewCards = [
    {
      title: '待审核',
      value: reviewStats.pending,
      color: '#fff8e1',
      textColor: '#ff9800',
    },
    {
      title: '已通过',
      value: reviewStats.approved,
      color: '#e8f5e9',
      textColor: '#4caf50',
    },
    {
      title: '已拒绝',
      value: reviewStats.rejected,
      color: '#ffebee',
      textColor: '#f44336',
    },
    {
      title: '总计',
      value: reviewStats.total,
      color: '#e3f2fd',
      textColor: '#2196f3',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 顶部导航栏 */}
      <AppBar position="static" sx={{ backgroundColor: '#ff6b9d' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            后台管理系统
          </Typography>
          {user && (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{user.username}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  退出登录
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 欢迎信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              欢迎回来，{user?.username || '管理员'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              这里是系统仪表盘，您可以查看网站的各项统计数据和管理功能。
            </Typography>
          </Paper>
        </motion.div>

        {/* 统计卡片 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: card.color,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h3"
                          component="div"
                          sx={{ fontWeight: 'bold', mb: 1 }}
                        >
                          {card?.value?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.title}
                        </Typography>
                      </Box>
                      {card.icon}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* 管理功能 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 3, fontWeight: 'bold' }}
            >
              管理功能
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '1fr 1fr 1fr',
                },
                gap: 2,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PhotoLibrary />}
                sx={{ py: 2 }}
              >
                图片管理
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<VideoLibrary />}
                sx={{ py: 2 }}
              >
                视频管理
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RateReview />}
                sx={{ py: 2 }}
                onClick={() => navigate('/review')}
              >
                图片审核
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Notifications />}
                sx={{ py: 2 }}
                onClick={() => navigate('/notification')}
              >
                系统通知
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* 审核统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 3, fontWeight: 'bold' }}
            >
              图片审核统计
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '1fr 1fr 1fr 1fr',
                },
                gap: 3,
              }}
            >
              {reviewCards.map((card, index) => (
                <Box key={card.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        backgroundColor: card.color,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            color: card.textColor,
                          }}
                        >
                          {card.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              ))}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;
