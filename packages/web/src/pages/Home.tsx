import { MusicPlayer } from '@katou-megumi/shared';
import {
	ArrowForward,
	Brush,
	Download,
	Favorite,
	PhotoLibrary,
	PlayArrow,
	Share,
	VideoLibrary,
	Wallpaper,
	Work,
} from '@mui/icons-material';
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Container,
	Paper,
	Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { worksAPI, videosAPI } from '../utils/api';

// 类型定义
interface Work {
	id: number;
	title: string;
	subtitle: string;
	description: string;
	year: string;
	type: string;
	poster?: string;
	thumbnail?: string;
	rating: number;
}

interface Video {
	id: number;
	title: string;
	description: string;
	thumbnail?: string;
	duration: string;
	views: number;
	likes: number;
}

const Home: React.FC = () => {
	const { t } = useTranslation();

	// 状态管理
	const [works, setWorks] = useState<Work[]>([]);
	const [videos, setVideos] = useState<Video[]>([]);
	const [loading, setLoading] = useState(true);

	// API 调用函数
	const fetchWorks = async () => {
		try {
			const response = await worksAPI.getWorks();
			setWorks(response.data.data.works || []);
		} catch (error) {
			console.error('获取作品数据失败:', error);
		}
	};

	const fetchVideos = async () => {
		try {
			const response = await videosAPI.getVideos();
			setVideos(response.data.data.videos || []);
		} catch (error) {
			console.error('获取视频数据失败:', error);
		}
	};

	// 组件挂载时获取数据
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await Promise.all([fetchWorks(), fetchVideos()]);
			setLoading(false);
		};
		loadData();
	}, []);

	return (
		<Box>
			{/* Hero Section - 参考图片设计 */}
			<Box
				sx={{
					background:
						'linear-gradient(135deg, #ffb3d9 0%, #ffc1e3 50%, #ffe0f0 100%)',
					minHeight: '100vh',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{/* 背景装饰圆圈 */}
				<Box
					sx={{
						position: 'absolute',
						top: -100,
						right: -100,
						width: 300,
						height: 300,
						borderRadius: '50%',
						background: 'rgba(255, 255, 255, 0.1)',
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						bottom: -150,
						left: -150,
						width: 400,
						height: 400,
						borderRadius: '50%',
						background: 'rgba(255, 255, 255, 0.05)',
					}}
				/>

				<Container
					maxWidth='lg'
					sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}
				>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
							gap: 4,
							alignItems: 'center',
							width: '100%',
						}}
					>
						{/* 左侧内容 */}
						<Box>
							<motion.div
								initial={{ opacity: 0, x: -50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
							>
								<Typography
									variant='overline'
									sx={{
										color: '#d81b60',
										fontWeight: 'bold',
										letterSpacing: 2,
										mb: 2,
										display: 'block',
									}}
								>
									{t('home.welcome')}
								</Typography>

								<Typography
									variant='h1'
									component='h1'
									sx={{
										fontSize: { xs: '3rem', md: '4rem' },
										fontWeight: 'bold',
										color: '#2d2d2d',
										mb: 2,
										lineHeight: 1.2,
									}}
								>
									{t('home.title')}
								</Typography>

								<Typography
									variant='h6'
									sx={{
										color: '#666',
										mb: 1,
										fontStyle: 'italic',
									}}
								>
									{t('home.subtitle')}
								</Typography>

								<Typography
									variant='body1'
									sx={{
										color: '#666',
										mb: 4,
										fontSize: '1.1rem',
										lineHeight: 1.6,
									}}
								>
									{t('home.description')}
								</Typography>

								{/* 操作按钮 */}
								<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
									<Button
										variant='contained'
										size='large'
										startIcon={<PlayArrow />}
										sx={{
											backgroundColor: '#ff4081',
											color: 'white',
											px: 3,
											py: 1.5,
											borderRadius: 3,
											fontSize: '1rem',
											fontWeight: 'bold',
											'&:hover': {
												backgroundColor: '#e91e63',
												transform: 'translateY(-2px)',
											},
											transition: 'all 0.3s ease',
										}}
									>
										{t('home.viewCollection')}
									</Button>

									<Button
										variant='outlined'
										size='large'
										startIcon={<Download />}
										sx={{
											borderColor: '#ff4081',
											color: '#ff4081',
											px: 3,
											py: 1.5,
											borderRadius: 3,
											fontSize: '1rem',
											fontWeight: 'bold',
											'&:hover': {
												backgroundColor: '#ff4081',
												color: 'white',
												transform: 'translateY(-2px)',
											},
											transition: 'all 0.3s ease',
										}}
									>
										{t('home.downloadWallpaper')}
									</Button>

									<Button
										variant='text'
										size='large'
										startIcon={<Share />}
										sx={{
											color: '#ff4081',
											px: 2,
											py: 1.5,
											fontSize: '1rem',
											'&:hover': {
												backgroundColor: 'rgba(255, 64, 129, 0.1)',
											},
										}}
									>
										{t('home.share')}
									</Button>
								</Box>

								{/* 用户头像和收藏 */}
								<Box
									sx={{ display: 'flex', alignItems: 'center', mt: 4, gap: 2 }}
								>
									<Avatar sx={{ bgcolor: '#ff4081' }}>D</Avatar>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Favorite sx={{ color: '#ff4081', fontSize: 20 }} />
										<Typography variant='body2' color='text.secondary'>
											{t('home.favorite') || '收藏'}
										</Typography>
									</Box>
								</Box>
							</motion.div>
						</Box>

						{/* 右侧图片区域 */}
						<Box>
							<motion.div
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
							>
								<Box
									sx={{
										position: 'relative',
										height: 500,
										backgroundImage:
											'url(https://via.placeholder.com/600x500/ff6b9d/ffffff?text=加藤惠)',
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										borderRadius: 4,
										overflow: 'hidden',
										boxShadow: '0 8px 32px rgba(255, 107, 157, 0.3)',
									}}
								/>
							</motion.div>
						</Box>
					</Box>
				</Container>
			</Box>

			{/* 角色介绍区域 */}
			<Container maxWidth='lg' sx={{ py: 8 }}>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.5 }}
				>
					<Typography
						variant='h3'
						component='h2'
						align='center'
						sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}
					>
						角色介绍
					</Typography>
					<Typography
						variant='h6'
						align='center'
						color='text.secondary'
						sx={{ mb: 6 }}
					>
						深入了解这位似平凡却满魅力的女主角
					</Typography>

					{/* 角色介绍三栏布局 */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								md: 'repeat(3, 1fr)',
							},
							gap: 4,
							mb: 8,
						}}
					>
						{/* 基本信息 */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							<Paper elevation={3} sx={{ p: 3, height: '100%' }}>
								<Typography
									variant='h5'
									sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}
								>
									基本信息
								</Typography>
								<Box sx={{ '& > div': { mb: 2 } }}>
									<Box>
										<Typography variant='subtitle2' color='text.secondary'>
											姓名:
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 'medium' }}>
											加藤惠
										</Typography>
									</Box>
									<Box>
										<Typography variant='subtitle2' color='text.secondary'>
											年龄:
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 'medium' }}>
											17岁
										</Typography>
									</Box>
									<Box>
										<Typography variant='subtitle2' color='text.secondary'>
											学校:
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 'medium' }}>
											丰之崎学园
										</Typography>
									</Box>
									<Box>
										<Typography variant='subtitle2' color='text.secondary'>
											年级:
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 'medium' }}>
											2年B班
										</Typography>
									</Box>
									<Box>
										<Typography variant='subtitle2' color='text.secondary'>
											生日:
										</Typography>
										<Typography variant='body1' sx={{ fontWeight: 'medium' }}>
											9月23日
										</Typography>
									</Box>
								</Box>
							</Paper>
						</motion.div>

						{/* 性格特点 */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Paper elevation={3} sx={{ p: 3, height: '100%' }}>
								<Typography
									variant='h5'
									sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}
								>
									性格特点
								</Typography>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
									{[
										'⭐ 温柔体贴',
										'⭐ 善解人意',
										'⭐ 平易近人',
										'⭐ 内心坚强',
										'⭐ 默默支持他人',
									].map((trait, index) => (
										<Typography
											key={index}
											variant='body2'
											sx={{ color: '#ff6b9d' }}
										>
											{trait}
										</Typography>
									))}
								</Box>
							</Paper>
						</motion.div>

						{/* 角色魅力 */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
						>
							<Paper elevation={3} sx={{ p: 3, height: '100%' }}>
								<Typography
									variant='h5'
									sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}
								>
									角色魅力
								</Typography>
								<Typography
									variant='body2'
									sx={{ lineHeight: 1.8, color: 'text.secondary' }}
								>
									加藤惠是一个看似平凡的女孩，但正是这种平凡中蕴含着
									特别的魅力。她的温柔、理解和支持，让她成为了
									真正的女主角，她教会我们，真正的美不在于外表，
									而在于内心的善良和真诚。
								</Typography>
							</Paper>
						</motion.div>
					</Box>

					{/* 图片画廊区域 */}
					<Typography
						variant='h3'
						component='h2'
						align='center'
						sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}
					>
						图片画廊
					</Typography>
					<Typography
						variant='h6'
						align='center'
						color='text.secondary'
						sx={{ mb: 6 }}
					>
						精美图片分类展示
					</Typography>

					{/* 图片画廊四分类 */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								sm: 'repeat(2, 1fr)',
								md: 'repeat(4, 1fr)',
							},
							gap: 3,
						}}
					>
						{/* 官方图片 */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							<Card
								sx={{
									height: '100%',
									transition: 'all 0.3s ease',
									'&:hover': {
										transform: 'translateY(-8px)',
										boxShadow: '0 12px 40px rgba(255, 107, 157, 0.2)',
									},
								}}
							>
								<CardMedia
									component='div'
									sx={{
										height: 200,
										background: 'linear-gradient(45deg, #ff6b9d, #ff8cc8)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<PhotoLibrary sx={{ fontSize: 60, color: 'white' }} />
								</CardMedia>
								<CardContent>
									<Typography variant='h6' component='h3' sx={{ mb: 2 }}>
										官方图片
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
										sx={{ mb: 3 }}
									>
										官方发布的高质量角色图片
									</Typography>
									<Button
										component={Link}
										to='/gallery?category=official'
										variant='outlined'
										size='small'
										endIcon={<ArrowForward />}
										sx={{ color: 'primary.main' }}
									>
										查看更多
									</Button>
								</CardContent>
							</Card>
						</motion.div>

						{/* 动漫截图 */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Card
								sx={{
									height: '100%',
									transition: 'all 0.3s ease',
									'&:hover': {
										transform: 'translateY(-8px)',
										boxShadow: '0 12px 40px rgba(255, 107, 157, 0.2)',
									},
								}}
							>
								<CardMedia
									component='div'
									sx={{
										height: 200,
										background: 'linear-gradient(45deg, #ff8cc8, #ffb3d9)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<VideoLibrary sx={{ fontSize: 60, color: 'white' }} />
								</CardMedia>
								<CardContent>
									<Typography variant='h6' component='h3' sx={{ mb: 2 }}>
										动漫截图
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
										sx={{ mb: 3 }}
									>
										动画中的精彩瞬间截图
									</Typography>
									<Button
										component={Link}
										to='/gallery?category=anime'
										variant='outlined'
										size='small'
										endIcon={<ArrowForward />}
										sx={{ color: 'primary.main' }}
									>
										查看更多
									</Button>
								</CardContent>
							</Card>
						</motion.div>

						{/* 壁纸 */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
						>
							<Card
								sx={{
									height: '100%',
									transition: 'all 0.3s ease',
									'&:hover': {
										transform: 'translateY(-8px)',
										boxShadow: '0 12px 40px rgba(255, 107, 157, 0.2)',
									},
								}}
							>
								<CardMedia
									component='div'
									sx={{
										height: 200,
										background: 'linear-gradient(45deg, #ffb3d9, #ffc9e6)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Wallpaper sx={{ fontSize: 60, color: 'white' }} />
								</CardMedia>
								<CardContent>
									<Typography variant='h6' component='h3' sx={{ mb: 2 }}>
										精美壁纸
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
										sx={{ mb: 3 }}
									>
										高清桌面壁纸下载
									</Typography>
									<Button
										component={Link}
										to='/gallery?category=wallpaper'
										variant='outlined'
										size='small'
										endIcon={<ArrowForward />}
										sx={{ color: 'primary.main' }}
									>
										查看更多
									</Button>
								</CardContent>
							</Card>
						</motion.div>

						{/* 同人作品 */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
						>
							<Card
								sx={{
									height: '100%',
									transition: 'all 0.3s ease',
									'&:hover': {
										transform: 'translateY(-8px)',
										boxShadow: '0 12px 40px rgba(255, 107, 157, 0.2)',
									},
								}}
							>
								<CardMedia
									component='div'
									sx={{
										height: 200,
										background: 'linear-gradient(45deg, #ffc9e6, #ffe0f0)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Brush sx={{ fontSize: 60, color: 'white' }} />
								</CardMedia>
								<CardContent>
									<Typography variant='h6' component='h3' sx={{ mb: 2 }}>
										同人作品
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
										sx={{ mb: 3 }}
									>
										粉丝创作的精美同人图
									</Typography>
									<Button
										component={Link}
										to='/gallery?category=fanart'
										variant='outlined'
										size='small'
										endIcon={<ArrowForward />}
										sx={{ color: 'primary.main' }}
									>
										查看更多
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					</Box>
				</motion.div>
			</Container>

			{/* 相关作品区域 */}
			<Container maxWidth='lg' sx={{ py: 8, backgroundColor: '#fafafa' }}>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					<Typography
						variant='h3'
						component='h2'
						align='center'
						sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}
					>
						相关作品
					</Typography>
					<Typography
						variant='h6'
						align='center'
						color='text.secondary'
						sx={{ mb: 6 }}
					>
						了解加藤惠出现的所有作品
					</Typography>

					{/* 相关作品动态渲染 */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								md: 'repeat(3, 1fr)',
							},
							gap: 4,
						}}
					>
						{loading
							? // 加载状态
								[1, 2, 3].map((index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
									>
										<Card sx={{ height: '100%' }}>
											<Box
												sx={{
													height: 200,
													backgroundColor: '#f0f0f0',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<Typography variant='h6' color='text.secondary'>
													加载中...
												</Typography>
											</Box>
											<CardContent>
												<Typography
													variant='h6'
													sx={{ mb: 1, color: 'text.secondary' }}
												>
													加载中...
												</Typography>
												<Typography
													variant='body2'
													color='text.secondary'
													sx={{ mb: 2 }}
												>
													请稍候
												</Typography>
											</CardContent>
										</Card>
									</motion.div>
								))
							: // 实际数据
								works.slice(0, 3).map((work, index) => (
									<motion.div
										key={work.id}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
									>
										<Card
											sx={{
												height: '100%',
												transition: 'all 0.3s ease',
												'&:hover': {
													transform: 'translateY(-8px)',
													boxShadow: '0 12px 40px rgba(255, 107, 157, 0.2)',
												},
											}}
										>
											{work.thumbnail ? (
												<CardMedia
													component='img'
													height='200'
													image={work.thumbnail}
													alt={work.title}
													sx={{ objectFit: 'cover' }}
												/>
											) : (
												<Box
													sx={{
														height: 200,
														backgroundColor: '#e0e0e0',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													<Typography variant='h6' color='text.secondary'>
														作品封面
													</Typography>
												</Box>
											)}
											<CardContent>
												<Typography
													variant='h6'
													sx={{ mb: 1, color: 'primary.main' }}
												>
													{work.title}
												</Typography>
												<Typography
													variant='body2'
													color='text.secondary'
													sx={{ mb: 2 }}
												>
													{work.subtitle}
												</Typography>
												<Typography
													variant='body2'
													sx={{
														mb: 2,
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical',
													}}
												>
													{work.description}
												</Typography>
												<Box
													sx={{
														display: 'flex',
														justifyContent: 'space-between',
														alignItems: 'center',
													}}
												>
													<Typography
														variant='caption'
														sx={{ color: 'primary.main' }}
													>
														{work.year}
													</Typography>
													<Typography
														variant='caption'
														sx={{ color: 'primary.main' }}
													>
														观看
													</Typography>
												</Box>
											</CardContent>
										</Card>
									</motion.div>
								))}
					</Box>
				</motion.div>
			</Container>

			{/* 精彩视频区域 */}
			<Container maxWidth='lg' sx={{ py: 8 }}>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.3 }}
				>
					<Typography
						variant='h3'
						component='h2'
						align='center'
						sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}
					>
						精彩视频
					</Typography>
					<Typography
						variant='h6'
						align='center'
						color='text.secondary'
						sx={{ mb: 6 }}
					>
						观看加藤惠的精彩片段
					</Typography>

					{/* 精彩视频动态渲染 */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								md: 'repeat(3, 1fr)',
							},
							gap: 4,
						}}
					>
						{loading
							? // 加载状态
								[1, 2, 3].map((index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
									>
										<Card sx={{ height: '100%' }}>
											<Box
												sx={{
													height: 200,
													backgroundColor: '#f0f0f0',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<VideoLibrary
													sx={{
														fontSize: 60,
														color: 'text.secondary',
														opacity: 0.5,
													}}
												/>
											</Box>
											<CardContent>
												<Typography
													variant='h6'
													sx={{ mb: 1, color: 'text.secondary' }}
												>
													加载中...
												</Typography>
												<Typography variant='body2' color='text.secondary'>
													请稍候
												</Typography>
											</CardContent>
										</Card>
									</motion.div>
								))
							: // 实际数据
								videos.slice(0, 3).map((video, index) => (
									<motion.div
										key={video.id}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
									>
										<Card
											sx={{
												height: '100%',
												transition: 'all 0.3s ease',
												'&:hover': {
													transform: 'translateY(-8px)',
													boxShadow: '0 12px 40px rgba(255, 107, 157, 0.2)',
												},
											}}
										>
											{video.thumbnail ? (
												<Box sx={{ position: 'relative' }}>
													<CardMedia
														component='img'
														height='200'
														image={video.thumbnail}
														alt={video.title}
														sx={{ objectFit: 'cover' }}
													/>
													<Box
														sx={{
															position: 'absolute',
															top: 8,
															right: 8,
															backgroundColor: 'rgba(0,0,0,0.6)',
															borderRadius: 1,
															px: 1,
														}}
													>
														<Typography
															variant='caption'
															sx={{ color: 'white' }}
														>
															♡ {video.likes}
														</Typography>
													</Box>
													<Box
														sx={{
															position: 'absolute',
															bottom: 8,
															right: 8,
															backgroundColor: 'rgba(0,0,0,0.8)',
															borderRadius: 1,
															px: 1,
														}}
													>
														<Typography
															variant='caption'
															sx={{ color: 'white' }}
														>
															{video.duration}
														</Typography>
													</Box>
													<Box
														sx={{
															position: 'absolute',
															top: '50%',
															left: '50%',
															transform: 'translate(-50%, -50%)',
														}}
													>
														<PlayArrow
															sx={{
																fontSize: 48,
																color: 'white',
																opacity: 0.8,
															}}
														/>
													</Box>
												</Box>
											) : (
												<Box
													sx={{
														height: 200,
														backgroundColor: '#b0b0b0',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														position: 'relative',
													}}
												>
													<VideoLibrary
														sx={{ fontSize: 60, color: 'white', opacity: 0.8 }}
													/>
													<Box
														sx={{
															position: 'absolute',
															top: 8,
															right: 8,
															backgroundColor: 'rgba(0,0,0,0.6)',
															borderRadius: 1,
															px: 1,
														}}
													>
														<Typography
															variant='caption'
															sx={{ color: 'white' }}
														>
															♡ {video.likes}
														</Typography>
													</Box>
												</Box>
											)}
											<CardContent>
												<Typography variant='h6' sx={{ mb: 1 }}>
													{video.title}
												</Typography>
												<Typography
													variant='body2'
													color='text.secondary'
													sx={{ mb: 1 }}
												>
													{video.description}
												</Typography>
												<Typography variant='caption' color='text.secondary'>
													{video.views.toLocaleString()} 次观看
												</Typography>
											</CardContent>
										</Card>
									</motion.div>
								))}
					</Box>
				</motion.div>
			</Container>

			{/* 音乐播放器 */}
			<MusicPlayer />
		</Box>
	);
};

export default Home;
