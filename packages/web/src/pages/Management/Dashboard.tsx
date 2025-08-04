import React, { useEffect, useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
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
	Dashboard as DashboardIcon,
	People,
	PhotoLibrary,
	VideoLibrary,
	Settings,
	ExitToApp,
	AccountCircle,
	RateReview,
	Pending,
	CheckCircle,
	Cancel,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
			navigate('/management');
			return;
		}

		try {
			setUser(JSON.parse(userData));
		} catch (error) {
			console.error('解析用户数据失败:', error);
			navigate('/management');
		}

		// 获取仪表板统计数据
		fetchDashboardStats();
		fetchReviewStats();
	}, [navigate]);

	const fetchDashboardStats = async () => {
		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch('http://localhost:8080/api/admin/stats', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setStats(data.data);
			}
		} catch (error) {
			console.error('获取统计数据失败:', error);
		}
	};

	const fetchReviewStats = async () => {
		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch('http://localhost:8080/api/review/stats', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setReviewStats(data.data);
			}
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
		navigate('/management');
	};

	const statsCards = [
		{
			title: '注册用户',
			value: stats.totalUsers,
			icon: <People sx={{ fontSize: 40 }} />,
			color: '#ff6b9d',
		},
		{
			title: '图片总数',
			value: stats.totalImages,
			icon: <PhotoLibrary sx={{ fontSize: 40 }} />,
			color: '#ff8cc8',
		},
		{
			title: '视频总数',
			value: stats.totalVideos,
			icon: <VideoLibrary sx={{ fontSize: 40 }} />,
			color: '#ffb3d9',
		},
		{
			title: '总访问量',
			value: stats.totalViews,
			icon: <DashboardIcon sx={{ fontSize: 40 }} />,
			color: '#ffc9e6',
		},
	];

	const reviewCards = [
		{
			title: '待审核',
			value: reviewStats.pending,
			icon: <Pending sx={{ fontSize: 40 }} />,
			color: '#ff9800',
		},
		{
			title: '已通过',
			value: reviewStats.approved,
			icon: <CheckCircle sx={{ fontSize: 40 }} />,
			color: '#4caf50',
		},
		{
			title: '已拒绝',
			value: reviewStats.rejected,
			icon: <Cancel sx={{ fontSize: 40 }} />,
			color: '#f44336',
		},
		{
			title: '审核总数',
			value: reviewStats.total,
			icon: <RateReview sx={{ fontSize: 40 }} />,
			color: '#9c27b0',
		},
	];

	if (!user) {
		return null;
	}

	return (
		<Box sx={{ flexGrow: 1 }}>
			{/* 顶部导航栏 */}
			<AppBar position='static' sx={{ backgroundColor: '#ff6b9d' }}>
				<Toolbar>
					<DashboardIcon sx={{ mr: 2 }} />
					<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
						加藤惠管理后台
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<Typography variant='body2' sx={{ mr: 2 }}>
							欢迎，{user.username}
						</Typography>
						<IconButton size='large' color='inherit' onClick={handleMenuOpen}>
							<AccountCircle />
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							<MenuItem onClick={handleMenuClose}>
								<Settings sx={{ mr: 1 }} />
								设置
							</MenuItem>
							<MenuItem onClick={handleLogout}>
								<ExitToApp sx={{ mr: 1 }} />
								退出登录
							</MenuItem>
						</Menu>
					</Box>
				</Toolbar>
			</AppBar>

			{/* 主要内容 */}
			<Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
				{/* 欢迎信息 */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Paper
						sx={{
							p: 3,
							mb: 4,
							background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8cc8 100%)',
							color: 'white',
						}}
					>
						<Typography
							variant='h4'
							component='h1'
							sx={{ fontWeight: 'bold', mb: 1 }}
						>
							欢迎回来，{user.username}！
						</Typography>
						<Typography variant='h6'>这里是加藤惠粉丝网站的管理中心</Typography>
					</Paper>
				</motion.div>

				{/* 统计卡片 */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: '1fr 1fr',
							md: '1fr 1fr 1fr 1fr',
						},
						gap: 3,
						mb: 4,
					}}
				>
					{statsCards.map((card, index) => (
						<Box key={card.title}>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
							>
								<Card
									sx={{
										height: '100%',
										transition: 'all 0.3s ease',
										'&:hover': {
											transform: 'translateY(-4px)',
											boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
										},
									}}
								>
									<CardContent sx={{ textAlign: 'center', p: 3 }}>
										<Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
										<Typography
											variant='h4'
											component='div'
											sx={{ fontWeight: 'bold', color: card.color }}
										>
											{card.value.toLocaleString()}
										</Typography>
										<Typography variant='body2' color='text.secondary'>
											{card.title}
										</Typography>
									</CardContent>
								</Card>
							</motion.div>
						</Box>
					))}
				</Box>

				{/* 快速操作 */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Paper sx={{ p: 3 }}>
						<Typography
							variant='h5'
							component='h2'
							sx={{ mb: 3, fontWeight: 'bold' }}
						>
							快速操作
						</Typography>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: {
									xs: '1fr',
									sm: '1fr 1fr',
									md: '1fr 1fr 1fr 1fr',
								},
								gap: 2,
							}}
						>
							<Button
								fullWidth
								variant='outlined'
								startIcon={<People />}
								sx={{ py: 2 }}
							>
								用户管理
							</Button>
							<Button
								fullWidth
								variant='outlined'
								startIcon={<PhotoLibrary />}
								sx={{ py: 2 }}
							>
								图片管理
							</Button>
							<Button
								fullWidth
								variant='outlined'
								startIcon={<VideoLibrary />}
								sx={{ py: 2 }}
							>
								视频管理
							</Button>
							<Button
								fullWidth
								variant='outlined'
								startIcon={<RateReview />}
								sx={{ py: 2 }}
								onClick={() => window.open('/management/review', '_blank')}
							>
								图片审核
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
							variant='h5'
							component='h2'
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
												transition: 'all 0.3s ease',
												'&:hover': {
													transform: 'translateY(-4px)',
													boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
												},
											}}
										>
											<CardContent sx={{ textAlign: 'center', p: 3 }}>
												<Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
												<Typography
													variant='h4'
													component='div'
													sx={{ fontWeight: 'bold', color: card.color }}
												>
													{card.value.toLocaleString()}
												</Typography>
												<Typography variant='body2' color='text.secondary'>
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
