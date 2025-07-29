import React from 'react';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Box,
	Container,
	IconButton,
} from '@mui/material';
import { FavoriteBorder, Search, NotificationsNone } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LanguageSwitcher } from '@katou-megumi/shared';

const Header: React.FC = () => {
	// const { t } = useTranslation();
	const location = useLocation();

	const navItems = [
		{ label: '首页', path: '/' },
		{ label: '角色介绍', path: '/about' },
		{ label: '图片画廊', path: '/gallery' },
		{ label: '相关作品', path: '/works' },
		{ label: '精彩视频', path: '/videos' },
		{ label: '文件上传', path: '/upload' },
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
							<NotificationsNone fontSize='small' />
						</IconButton>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
