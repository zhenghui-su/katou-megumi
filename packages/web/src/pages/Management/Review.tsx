import React, { useEffect, useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	Grid,
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

interface PendingImage {
	id: number;
	title: string;
	description?: string;
	url: string;
	category: string;
	originalFilename: string;
	fileSize: number;
	mimeType: string;
	status: 'pending' | 'approved' | 'rejected';
	rejectReason?: string;
	user: {
		id: number;
		username: string;
		email: string;
	};
	createdAt: string;
	reviewedAt?: string;
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
			role='tabpanel'
			hidden={value !== index}
			id={`review-tabpanel-${index}`}
			aria-labelledby={`review-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

const Review: React.FC = () => {
	const navigate = useNavigate();
	const [images, setImages] = useState<PendingImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [tabValue, setTabValue] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedImage, setSelectedImage] = useState<PendingImage | null>(null);
	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
	const [reviewForm, setReviewForm] = useState({
		action: 'approve' as 'approve' | 'reject',
		title: '',
		description: '',
		category: 'fanart',
		rejectReason: '',
	});
	const [message, setMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	const statusMap = {
		0: 'pending',
		1: 'approved',
		2: 'rejected',
	};

	useEffect(() => {
		// 检查登录状态
		const token = localStorage.getItem('admin_token');
		if (!token) {
			navigate('/management');
			return;
		}

		fetchImages();
	}, [navigate, tabValue, page]);

	const fetchImages = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('admin_token');
			const status = statusMap[tabValue as keyof typeof statusMap];
			const response = await fetch(
				`http://localhost:3001/api/review/pending?status=${status}&page=${page}&limit=12`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setImages(data.data.images);
				setTotalPages(data.data.totalPages);
			} else {
				setMessage({ type: 'error', text: '获取图片列表失败' });
			}
		} catch (error) {
			setMessage({ type: 'error', text: '网络错误' });
		} finally {
			setLoading(false);
		}
	};

	const handleReview = async () => {
		if (!selectedImage) return;

		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch(
				`http://localhost:3001/api/review/approve/${selectedImage.id}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(reviewForm),
				}
			);

			if (response.ok) {
				const data = await response.json();
				setMessage({
					type: 'success',
					text: data.message,
				});
				setReviewDialogOpen(false);
				fetchImages(); // 刷新列表
			} else {
				const data = await response.json();
				setMessage({ type: 'error', text: data.message || '审核失败' });
			}
		} catch (error) {
			setMessage({ type: 'error', text: '网络错误' });
		}
	};

	const openReviewDialog = (
		image: PendingImage,
		action: 'approve' | 'reject'
	) => {
		setSelectedImage(image);
		setReviewForm({
			action,
			title: image.title,
			description: image.description || '',
			category: image.category,
			rejectReason: '',
		});
		setReviewDialogOpen(true);
	};

	const openPreviewDialog = (image: PendingImage) => {
		setSelectedImage(image);
		setPreviewDialogOpen(true);
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
						图片审核管理
					</Typography>
					<IconButton color='inherit' onClick={fetchImages}>
						<Refresh />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Container maxWidth='lg' sx={{ py: 4 }}>
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
				<Paper sx={{ mb: 3 }}>
					<Tabs
						value={tabValue}
						onChange={(_e, newValue) => {
							setTabValue(newValue);
							setPage(1);
						}}
						centered
					>
						<Tab label='待审核' />
						<Tab label='已通过' />
						<Tab label='已拒绝' />
					</Tabs>
				</Paper>

				{/* 图片列表 */}
				<TabPanel value={tabValue} index={0}>
					{loading ? (
						<Typography align='center'>加载中...</Typography>
					) : images.length === 0 ? (
						<Typography align='center' color='text.secondary'>
							暂无待审核图片
						</Typography>
					) : (
						<Grid container spacing={3}>
							{images.map((image, index) => (
								<Grid component={motion.div} key={image.id}>
									<motion.div
										initial={{ opacity: 0, y: 30 }}
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
										component='img'
										image={image.url}
										alt={image.title}
										sx={{
											height: '120px',
											maxHeight: '120px',
											width: '100%',
											objectFit: 'cover',
											cursor: 'pointer'
										}}
										onClick={() => openPreviewDialog(image)}
											/>
											<CardContent sx={{ flexGrow: 1 }}>
												<Typography variant='h6' noWrap title={image.title}>
													{image.title}
												</Typography>
												<Typography variant='body2' color='text.secondary'>
													上传者: {image.user.username}
												</Typography>
												<Typography variant='body2' color='text.secondary'>
													大小: {formatFileSize(image.fileSize)}
												</Typography>
												<Chip
													label={getStatusText(image.status)}
													color={getStatusColor(image.status) as any}
													size='small'
													sx={{ mt: 1 }}
												/>
											</CardContent>
											{image.status === 'pending' && (
												<CardActions>
													<Button
														size='small'
														startIcon={<Visibility />}
														onClick={() => openPreviewDialog(image)}
													>
														预览
													</Button>
													<Button
														size='small'
														color='success'
														startIcon={<CheckCircle />}
														onClick={() => openReviewDialog(image, 'approve')}
													>
														通过
													</Button>
													<Button
														size='small'
														color='error'
														startIcon={<Cancel />}
														onClick={() => openReviewDialog(image, 'reject')}
													>
														拒绝
													</Button>
												</CardActions>
											)}
										</Card>
									</motion.div>
								</Grid>
							))}
						</Grid>
					)}
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					{/* 已通过的图片列表 */}
					{loading ? (
						<Typography align='center'>加载中...</Typography>
					) : images.length === 0 ? (
						<Typography align='center' color='text.secondary'>
							暂无已通过图片
						</Typography>
					) : (
						<Grid container spacing={3}>
							{images.map((image, index) => (
								<Grid component={motion.div} key={image.id}>
									<motion.div
										initial={{ opacity: 0, y: 30 }}
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
										component='img'
										image={image.url}
										alt={image.title}
										sx={{
											height: '120px',
											maxHeight: '120px',
											width: '100%',
											objectFit: 'cover',
											cursor: 'pointer'
										}}
										onClick={() => openPreviewDialog(image)}
									/>
											<CardContent sx={{ flexGrow: 1 }}>
												<Typography variant='h6' noWrap title={image.title}>
													{image.title}
												</Typography>
												<Typography variant='body2' color='text.secondary'>
													上传者: {image.user.username}
												</Typography>
												<Typography variant='body2' color='text.secondary'>
													审核时间:{' '}
													{new Date(image.reviewedAt!).toLocaleDateString()}
												</Typography>
												<Chip
													label={getStatusText(image.status)}
													color={getStatusColor(image.status) as any}
													size='small'
													sx={{ mt: 1 }}
												/>
											</CardContent>
										</Card>
									</motion.div>
								</Grid>
							))}
						</Grid>
					)}
				</TabPanel>

				<TabPanel value={tabValue} index={2}>
					{/* 已拒绝的图片列表 */}
					{loading ? (
						<Typography align='center'>加载中...</Typography>
					) : images.length === 0 ? (
						<Typography align='center' color='text.secondary'>
							暂无已拒绝图片
						</Typography>
					) : (
						<Grid container spacing={3}>
							{images.map((image, index) => (
								<Grid component={motion.div} key={image.id}>
									<motion.div
										initial={{ opacity: 0, y: 30 }}
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
										component='img'
										image={image.url}
										alt={image.title}
										sx={{
											height: '120px',
											maxHeight: '120px',
											width: '100%',
											objectFit: 'cover',
											cursor: 'pointer'
										}}
										onClick={() => openPreviewDialog(image)}
									/>
											<CardContent sx={{ flexGrow: 1 }}>
												<Typography variant='h6' noWrap title={image.title}>
													{image.title}
												</Typography>
												<Typography variant='body2' color='text.secondary'>
													上传者: {image.user.username}
												</Typography>
												<Typography variant='body2' color='error'>
													拒绝原因: {image.rejectReason}
												</Typography>
												<Chip
													label={getStatusText(image.status)}
													color={getStatusColor(image.status) as any}
													size='small'
													sx={{ mt: 1 }}
												/>
											</CardContent>
										</Card>
									</motion.div>
								</Grid>
							))}
						</Grid>
					)}
				</TabPanel>

				{/* 分页 */}
				{totalPages > 1 && (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
						<Pagination
							count={totalPages}
							page={page}
							onChange={(_e, value) => setPage(value)}
							color='primary'
						/>
					</Box>
				)}

				{/* 审核对话框 */}
				<Dialog
					open={reviewDialogOpen}
					onClose={() => setReviewDialogOpen(false)}
					maxWidth='sm'
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
									label='图片标题'
									value={reviewForm.title}
									onChange={(e) =>
										setReviewForm({ ...reviewForm, title: e.target.value })
									}
									margin='normal'
								/>
								<TextField
									fullWidth
									label='图片描述'
									value={reviewForm.description}
									onChange={(e) =>
										setReviewForm({
											...reviewForm,
											description: e.target.value,
										})
									}
									multiline
									rows={3}
									margin='normal'
								/>
								<FormControl fullWidth margin='normal'>
									<InputLabel>分类</InputLabel>
									<Select
										value={reviewForm.category}
										onChange={(e) =>
											setReviewForm({ ...reviewForm, category: e.target.value })
										}
									>
										<MenuItem value='official'>官方图片</MenuItem>
										<MenuItem value='anime'>动漫截图</MenuItem>
										<MenuItem value='wallpaper'>精美壁纸</MenuItem>
										<MenuItem value='fanart'>同人作品</MenuItem>
									</Select>
								</FormControl>
							</>
						) : (
							<TextField
								fullWidth
								label='拒绝原因'
								value={reviewForm.rejectReason}
								onChange={(e) =>
									setReviewForm({ ...reviewForm, rejectReason: e.target.value })
								}
								multiline
								rows={4}
								margin='normal'
								required
							/>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setReviewDialogOpen(false)}>取消</Button>
						<Button
							onClick={handleReview}
							variant='contained'
							color={reviewForm.action === 'approve' ? 'success' : 'error'}
						>
							{reviewForm.action === 'approve' ? '通过' : '拒绝'}
						</Button>
					</DialogActions>
				</Dialog>

				{/* 预览对话框 */}
				<Dialog
					open={previewDialogOpen}
					onClose={() => setPreviewDialogOpen(false)}
					maxWidth='md'
					fullWidth
				>
					<DialogTitle>图片预览</DialogTitle>
					<DialogContent>
						{selectedImage && (
							<Box>
								<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									mb: 2,
									border: '1px solid #e0e0e0',
									borderRadius: 1,
									minHeight: '200px',
								}}
							>
								<img
									src={selectedImage.url}
									alt={selectedImage.title}
									style={{
										maxWidth: '100%',
										maxHeight: '70vh',
										height: 'auto',
										width: 'auto',
										objectFit: 'contain',
										display: 'block',
									}}
								/>
								</Box>
								<Typography variant='h6'>{selectedImage.title}</Typography>
								<Typography variant='body2' color='text.secondary'>
									上传者: {selectedImage.user.username} (
									{selectedImage.user.email})
								</Typography>
								<Typography variant='body2' color='text.secondary'>
									文件大小: {formatFileSize(selectedImage.fileSize)}
								</Typography>
								<Typography variant='body2' color='text.secondary'>
									上传时间: {new Date(selectedImage.createdAt).toLocaleString()}
								</Typography>
								{selectedImage.description && (
									<Typography variant='body1' sx={{ mt: 2 }}>
										{selectedImage.description}
									</Typography>
								)}
							</Box>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setPreviewDialogOpen(false)}>关闭</Button>
						{selectedImage?.status === 'pending' && (
							<>
								<Button
									color='success'
									startIcon={<CheckCircle />}
									onClick={() => {
										setPreviewDialogOpen(false);
										openReviewDialog(selectedImage, 'approve');
									}}
								>
									通过
								</Button>
								<Button
									color='error'
									startIcon={<Cancel />}
									onClick={() => {
										setPreviewDialogOpen(false);
										openReviewDialog(selectedImage, 'reject');
									}}
								>
									拒绝
								</Button>
							</>
						)}
					</DialogActions>
				</Dialog>
			</Container>
		</Box>
	);
};

export default Review;
