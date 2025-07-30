import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Container,
	Grid,
	Card,
	CardMedia,
	CardContent,
	Button,
	Paper,
	Alert,
	Fab,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
} from '@mui/material';
import { Add, Close, Download, ZoomIn } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FileUpload } from '@katou-megumi/shared';

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
}

const Gallery: React.FC = () => {
	const { isAuthenticated, token } = useAuth();
	const [showUpload, setShowUpload] = useState(false);
	const [message, setMessage] = useState<{
		type: 'success' | 'error' | 'info';
		text: string;
	} | null>(null);
	const [images, setImages] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

	// 获取已通过审核的图片
	const fetchImages = async () => {
		try {
			setLoading(true);
			const response = await fetch('http://localhost:3001/api/gallery');
			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					setImages(result.data || []);
				}
			} else {
				console.error('获取图片失败:', response.statusText);
			}
		} catch (error) {
			console.error('获取图片错误:', error);
		} finally {
			setLoading(false);
		}
	};

	// 组件加载时获取图片
	useEffect(() => {
		fetchImages();
	}, []);

	const handleUploadSuccess = (files: UploadedFile[]) => {
		setMessage({
			type: 'info',
			text: `成功上传 ${files.length} 个文件！图片已提交审核，审核通过后将显示在画廊中。`,
		});
		setTimeout(() => setMessage(null), 5000);
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

	// 打开预览对话框
	const handleImageClick = (image: GalleryImage) => {
		setSelectedImage(image);
		setPreviewOpen(true);
	};

	// 关闭预览对话框
	const handleClosePreview = () => {
		setPreviewOpen(false);
		setSelectedImage(null);
	};

	// 下载图片
	const handleDownload = (image: GalleryImage) => {
		const link = document.createElement('a');
		link.href = image.url;
		link.download = image.title || 'image';
		link.target = '_blank';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<Typography variant='h2' component='h1' align='center' sx={{ mb: 2 }}>
					加藤惠画廊
				</Typography>
				<Typography
					variant='h6'
					align='center'
					color='text.secondary'
					sx={{ mb: 6 }}
				>
					收录加藤惠的精美图片集合
				</Typography>
			</motion.div>

			{loading ? (
				<Box sx={{ textAlign: 'center', py: 4 }}>
					<Typography variant='h6' color='text.secondary'>
						加载中...
					</Typography>
				</Box>
			) : images.length === 0 ? (
				<Box sx={{ textAlign: 'center', py: 4 }}>
					<Typography variant='h6' color='text.secondary'>
						暂无图片，快来上传第一张图片吧！
					</Typography>
				</Box>
			) : (
				<Grid container spacing={4}>
					{images.map((image, index) => (
						<Grid item xs={12} sm={6} md={4} key={image.id}>
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: index * 0.1 }}
							>
								<Card
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										cursor: 'pointer',
										transition:
											'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
										'&:hover': {
											transform: 'translateY(-8px)',
											boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
										},
									}}
									onClick={() => handleImageClick(image)}
								>
									<CardMedia
								component='img'
								image={image.url}
								alt={image.title}
								sx={{
									height: '200px',
									maxHeight: '200px',
									width: '100%',
									objectFit: 'cover',
								}}
							/>
									<CardContent sx={{ flexGrow: 1 }}>
										<Typography variant='h6' component='h3' sx={{ mb: 1 }}>
											{image.title}
										</Typography>
										<Typography variant='body2' color='text.secondary'>
											{image.description}
										</Typography>
									</CardContent>
								</Card>
							</motion.div>
						</Grid>
					))}
				</Grid>
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

			{/* 用户上传区域 */}
			{isAuthenticated && showUpload && (
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Paper elevation={3} sx={{ p: 3, mt: 4 }}>
						<Typography variant='h5' gutterBottom>
							上传图片
						</Typography>
						<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
							上传的图片将提交给管理员审核，审核通过后会显示在画廊中
						</Typography>
						<FileUpload
							multiple={true}
							acceptedTypes={['image/*']}
							maxFileSize={5 * 1024 * 1024} // 5MB
							onUploadSuccess={handleUploadSuccess}
							onUploadError={handleUploadError}
							authToken={token || undefined}
							apiUrl='http://localhost:3001/api/upload'
							showCategorySelect={true}
							defaultCategory='fanart'
						/>
						<Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
							<Button variant='outlined' onClick={() => setShowUpload(false)}>
								取消
							</Button>
						</Box>
					</Paper>
				</motion.div>
			)}

			<Box sx={{ mt: 6, textAlign: 'center' }}>
				<Typography variant='body1' color='text.secondary'>
					更多精美图片正在整理中，敬请期待...
				</Typography>
			</Box>

			{/* 浮动上传按钮 */}
			{isAuthenticated && !showUpload && (
				<Fab
					color='primary'
					aria-label='upload'
					onClick={() => setShowUpload(true)}
					sx={{
						position: 'fixed',
						bottom: 32,
						right: 32,
						zIndex: 1000,
					}}
				>
					<Add />
				</Fab>
			)}

			{/* 图片预览对话框 */}
			<Dialog
				open={previewOpen}
				onClose={handleClosePreview}
				maxWidth='lg'
				fullWidth
				PaperProps={{
					sx: {
						maxHeight: '90vh',
						overflow: 'hidden',
					},
				}}
			>
				<DialogTitle
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						pb: 1,
					}}
				>
					<Typography variant='h6'>
						{selectedImage?.title || '图片预览'}
					</Typography>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<IconButton
							color='primary'
							onClick={() => selectedImage && handleDownload(selectedImage)}
							title='下载图片'
						>
							<Download />
						</IconButton>
						<IconButton onClick={handleClosePreview} title='关闭'>
							<Close />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent sx={{ p: 0, overflow: 'hidden' }}>
					{selectedImage && (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								minHeight: '400px',
								maxHeight: '70vh',
								backgroundColor: '#f5f5f5',
							}}
						>
							<img
								src={selectedImage.url}
								alt={selectedImage.title}
								style={{
									maxWidth: '100%',
									maxHeight: '100%',
									height: 'auto',
									width: 'auto',
									objectFit: 'contain',
									display: 'block',
								}}
							/>
						</Box>
					)}
				</DialogContent>
				{selectedImage?.description && (
					<DialogActions sx={{ px: 3, pb: 2 }}>
						<Typography variant='body2' color='text.secondary'>
							{selectedImage.description}
						</Typography>
					</DialogActions>
				)}
			</Dialog>
		</Container>
	);
};

export default Gallery;
