import React, { useState, useEffect } from 'react';
import {
	Container,
	Typography,
	Box,
	Paper,
	Button,
	Alert,
	Card,
	CardContent,
	CardMedia,
	Chip,
} from '@mui/material';
import { FileUpload } from '@katou-megumi/shared';
import {
	CloudUpload,
	Image,
	VideoLibrary,
	AudioFile,
} from '@mui/icons-material';

interface UploadedFile {
	url: string;
	fileName: string;
	originalName: string;
	size: number;
	mimeType: string;
}

const UploadDemo: React.FC = () => {
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [message, setMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);







	const handleUploadSuccess = (files: UploadedFile[]) => {
		setUploadedFiles((prev) => [...prev, ...files]);
		setMessage({
			type: 'success',
			text: `成功上传 ${files.length} 个文件！`,
		});
		setTimeout(() => setMessage(null), 5000);
	};

	const handleUploadError = (error: string) => {
		setMessage({
			type: 'error',
			text: `上传失败: ${error}`,
		});
		setTimeout(() => setMessage(null), 5000);
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const getFileIcon = (mimeType: string) => {
		if (mimeType.startsWith('image/')) return <Image color='primary' />;
		if (mimeType.startsWith('video/')) return <VideoLibrary color='primary' />;
		if (mimeType.startsWith('audio/')) return <AudioFile color='primary' />;
		return <CloudUpload color='primary' />;
	};

	const clearAllFiles = () => {
		setUploadedFiles([]);
		setMessage(null);
	};

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant='h3' component='h1' gutterBottom>
					文件上传演示
				</Typography>
				<Typography variant='h6' color='text.secondary'>
					腾讯云对象存储 (COS) 文件上传功能 - 无需登录
				</Typography>
			</Box>

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

			{/* 功能说明 */}
			<Alert severity="info" sx={{ mb: 3 }}>
				<Typography variant="body1" sx={{ mb: 1 }}>
					✨ 现在可以直接上传文件，无需登录认证！
				</Typography>
				<Typography variant="body2" color="text.secondary">
					支持图片、视频、音频文件上传到腾讯云对象存储
				</Typography>
			</Alert>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				{/* 上传区域 */}
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: 4,
					}}
				>
					{/* 单文件上传 */}
					<Box sx={{ flex: 1 }}>
						<Paper elevation={3} sx={{ p: 3 }}>
							<Typography variant='h5' gutterBottom>
								单文件上传
							</Typography>
							<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
								一次只能上传一个文件
							</Typography>
							<FileUpload
								multiple={false}
								acceptedTypes={['image/*', 'video/*', 'audio/*']}
								maxFileSize={10 * 1024 * 1024}
								onUploadSuccess={handleUploadSuccess}
								onUploadError={handleUploadError}
								apiUrl="http://localhost:3001/api/upload/public"
							/>
						</Paper>
					</Box>

					{/* 多文件上传 */}
					<Box sx={{ flex: 1 }}>
						<Paper elevation={3} sx={{ p: 3 }}>
							<Typography variant='h5' gutterBottom>
								多文件上传
							</Typography>
							<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
								一次可以上传多个文件（最多5个）
							</Typography>
							<FileUpload
								multiple={true}
								acceptedTypes={['image/*', 'video/*', 'audio/*']}
								maxFileSize={10 * 1024 * 1024}
								onUploadSuccess={handleUploadSuccess}
								onUploadError={handleUploadError}
								apiUrl="http://localhost:3001/api/upload/public"
							/>
						</Paper>
					</Box>
				</Box>

				{/* 上传结果展示 */}
				<Box>
					<Paper elevation={3} sx={{ p: 3 }}>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								mb: 3,
							}}
						>
							<Typography variant='h5'>
								上传结果 ({uploadedFiles.length})
							</Typography>
							{uploadedFiles.length > 0 && (
								<Button
									variant='outlined'
									color='error'
									onClick={clearAllFiles}
								>
									清空所有
								</Button>
							)}
						</Box>

						{uploadedFiles.length === 0 ? (
							<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
								暂无上传文件
							</Typography>
						) : (
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: {
										xs: '1fr',
										sm: 'repeat(2, 1fr)',
										md: 'repeat(3, 1fr)',
									},
									gap: 2,
								}}
							>
								{uploadedFiles.map((file, index) => (
									<Card key={index}>
										{file.mimeType.startsWith('image/') ? (
											<CardMedia
												component='img'
												height='200'
												image={file.url}
												alt={file.originalName}
												sx={{ objectFit: 'cover' }}
											/>
										) : (
											<Box
												sx={{
													height: 200,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													backgroundColor: 'grey.100',
												}}
											>
												{getFileIcon(file.mimeType)}
											</Box>
										)}
										<CardContent>
											<Typography
												variant='subtitle2'
												noWrap
												title={file.originalName}
											>
												{file.originalName}
											</Typography>
											<Typography variant='body2' color='text.secondary'>
												{formatFileSize(file.size)}
											</Typography>
											<Chip
												label={file.mimeType}
												size='small'
												variant='outlined'
												sx={{ mt: 1 }}
											/>
											<Button
												fullWidth
												variant='outlined'
												size='small'
												href={file.url}
												target='_blank'
												rel='noopener noreferrer'
												sx={{ mt: 1 }}
											>
												查看文件
											</Button>
										</CardContent>
									</Card>
								))}
							</Box>
						)}
					</Paper>
				</Box>

				{/* 使用说明 */}
				<Box>
					<Paper elevation={3} sx={{ p: 3 }}>
						<Typography variant='h5' gutterBottom>
							使用说明
						</Typography>
						<Typography variant='body1' paragraph>
							1. <strong>支持的文件类型：</strong>图片（JPEG, PNG, GIF,
							WebP）、视频（MP4, WebM）、音频（MP3, WAV, OGG）
						</Typography>
						<Typography variant='body1' paragraph>
							2. <strong>文件大小限制：</strong>单个文件最大 10MB
						</Typography>
						<Typography variant='body1' paragraph>
							3. <strong>上传方式：</strong>支持点击选择文件或拖拽文件到上传区域
						</Typography>
						<Typography variant='body1' paragraph>
							4. <strong>存储服务：</strong>文件将上传到腾讯云对象存储（COS）
						</Typography>
						<Typography variant='body1'>
							5. <strong>权限要求：</strong>无需登录，可直接上传文件
						</Typography>
					</Paper>
				</Box>
			</Box>


		</Container>
	);
};

export default UploadDemo;
