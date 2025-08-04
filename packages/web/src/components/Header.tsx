import React, { useState } from 'react';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Box,
	Container,
	IconButton,
	Menu,
	MenuItem,
	Avatar,
	Badge,
} from '@mui/material';
import { FavoriteBorder, Search, NotificationsNone, AccountCircle, ExitToApp } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LanguageSwitcher } from '@katou-megumi/shared';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import AuthDialog from '../pages/Auth';
import NotificationPopover from './NotificationPopover';

const Header: React.FC = () => {
	// const { t } = useTranslation();
	const location = useLocation();
	const { user, isAuthenticated, logout } = useAuth();
	const { unreadCount } = useNotification();
	const [authDialogOpen, setAuthDialogOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

	const navItems = [
		{ label: '首页', path: '/' },
		{ label: '角色介绍', path: '/about' },
		{ label: '图片画廊', path: '/gallery' },
		{ label: '相关作品', path: '/works' },
		{ label: '精彩视频', path: '/videos' },
	];

	return (
		<AppBar
			position='sticky'
			elevation={0}
			sx={{
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				backdropFilter: 'blur(10px)',
				borderBottom: '1px solid rgba(255, 182, 193, 0.2)',
			}}
		>
			<Container maxWidth='lg'>
				<Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
					{/* Logo */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Box
								sx={{
									width: 32,
									height: 32,
									borderRadius: '50%',
									background: 'linear-gradient(45deg, #ff4081, #ff6ec7)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Typography
									sx={{
										color: 'white',
										fontWeight: 'bold',
										fontSize: '0.9rem',
									}}
								>
									♡
								</Typography>
							</Box>
							<Typography
								variant='h6'
								component={Link}
								to='/'
								sx={{
									textDecoration: 'none',
									color: '#ff4081',
									fontWeight: 'bold',
									fontSize: '1.3rem',
								}}
							>
								加藤惠 Official
							</Typography>
						</Box>
					</motion.div>

					{/* Navigation */}
					<Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
						{navItems.map((item, index) => (
							<motion.div
								key={item.path}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<Button
									component={Link}
									to={item.path}
									sx={{
										color: location.pathname === item.path ? '#ff4081' : '#666',
										fontWeight:
											location.pathname === item.path ? 'bold' : 'normal',
										px: 2,
										py: 1,
										borderRadius: 2,
										fontSize: '0.9rem',
										'&:hover': {
											backgroundColor: 'rgba(255, 64, 129, 0.1)',
											color: '#ff4081',
										},
									}}
								>
									{item.label}
								</Button>
							</motion.div>
						))}
					</Box>

					{/* Right side actions */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<LanguageSwitcher size='small' />

						<IconButton
							size='small'
							sx={{
								color: '#666',
								'&:hover': {
									color: '#ff4081',
									backgroundColor: 'rgba(255, 64, 129, 0.1)',
								},
							}}
						>
							<Search fontSize='small' />
						</IconButton>

						<IconButton
							size='small'
							sx={{
								color: '#666',
								'&:hover': {
									color: '#ff4081',
									backgroundColor: 'rgba(255, 64, 129, 0.1)',
								},
							}}
						>
							<FavoriteBorder fontSize='small' />
						</IconButton>

						{isAuthenticated && (
							<IconButton
								size='small'
								onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
								sx={{
									color: '#666',
									'&:hover': {
										color: '#ff4081',
										backgroundColor: 'rgba(255, 64, 129, 0.1)',
									},
								}}
							>
								<Badge badgeContent={unreadCount} color='error'>
									<NotificationsNone fontSize='small' />
								</Badge>
							</IconButton>
						)}

								{/* 用户认证区域 */}
								{isAuthenticated ? (
									<>
										<IconButton
											size='small'
											onClick={(e) => setAnchorEl(e.currentTarget)}
											sx={{ ml: 1 }}
										>
											<Avatar
												sx={{
													width: 32,
													height: 32,
													bgColor: 'primary.main',
													fontSize: '0.9rem',
												}}
											>
												{user?.username.charAt(0).toUpperCase()}
											</Avatar>
										</IconButton>
										<Menu
											anchorEl={anchorEl}
											open={Boolean(anchorEl)}
											onClose={() => setAnchorEl(null)}
										>
											<MenuItem onClick={() => setAnchorEl(null)}>
												<AccountCircle sx={{ mr: 1 }} />
												{user?.username}
											</MenuItem>
											<MenuItem
												onClick={() => {
													logout();
													setAnchorEl(null);
												}}
											>
												<ExitToApp sx={{ mr: 1 }} />
												退出登录
											</MenuItem>
										</Menu>
									</>
								) : (
									<Button
										variant='outlined'
										size='small'
										onClick={() => setAuthDialogOpen(true)}
										sx={{
											ml: 2,
											borderColor: '#ff4081',
											color: '#ff4081',
											'&:hover': {
												backgroundColor: '#ff4081',
												color: 'white',
											},
										}}
									>
										登录/注册
									</Button>
								)}
							</Box>
				</Toolbar>
			</Container>
			
			{/* 认证对话框 */}
			<AuthDialog
				open={authDialogOpen}
				onClose={() => setAuthDialogOpen(false)}
			/>
			
			{/* 通知弹窗 */}
			<NotificationPopover
				anchorEl={notificationAnchorEl}
				open={Boolean(notificationAnchorEl)}
				onClose={() => setNotificationAnchorEl(null)}
			/>
		</AppBar>
	);
};

export default Header;
