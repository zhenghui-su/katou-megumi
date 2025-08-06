import React, { useState, useRef } from 'react';
import {
	Box,
	LinearProgress,
	Typography,
	Alert,
	Chip,
	IconButton,
	List,
	ListItem,
	ListItemText,
	// 使用 ListItem 的 secondaryAction prop 替代已弃用的 ListItemSecondaryAction
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Card,
	CardMedia,
	Tooltip,
} from '@mui/material';

import {
	CloudUpload,
	Delete,
	CheckCircle,
	Error as ErrorIcon,
	Upload,
	Close,
} from '@mui/icons-material';
import '@ant-design/v5-patch-for-react-19';

interface UploadedFile {
	url: string;
	fileName: string;
	originalName: string;
	size: number;
	mimeType: string;
}

interface SelectedFile {
	file: File;
	previewUrl?: string;
}

interface FileUploadProps {
	multiple?: boolean;
	acceptedTypes?: string[];
	maxFileSize?: number; // in bytes
	onUploadSuccess?: (files: UploadedFile[]) => void;
	onUploadError?: (error: string) => void;
	authToken?: string;
	apiUrl?: string;
	showCategorySelect?: boolean;
	defaultCategory?: 'official' | 'anime' | 'wallpaper' | 'fanart';
	maxFiles?: number; // 最大文件数量
	width?: string | number; // 组件宽度
	height?: string | number; // 组件高度
	previewImageHeight?: number; // 预览图片高度
	showFileInfo?: boolean; // 是否显示文件信息
	showFileExtension?: boolean; // 是否显示文件后缀
	customDeleteIcon?: React.ReactNode; // 自定义删除按钮图标
}

const FileUpload: React.FC<FileUploadProps> = ({
	multiple = false,
	acceptedTypes = ['image/*', 'video/*', 'audio/*'],
	maxFileSize = 10 * 1024 * 1024, // 10MB
	onUploadSuccess,
	onUploadError,
	authToken,
	apiUrl = 'http://localhost:8080/api/upload',
	showCategorySelect = false,
	defaultCategory = 'fanart',
	maxFiles = 10,
	width = '100%',
	height = 'auto',
	previewImageHeight = 120,
	showFileInfo = true,
	showFileExtension = true,
	customDeleteIcon,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [_uploadProgress, setUploadProgress] = useState(0);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [dragOver, setDragOver] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<
		'official' | 'anime' | 'wallpaper' | 'fanart'
	>(defaultCategory);

	// 格式化文件大小
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatFileName = (fileName: string): string => {
		// 解码URL编码的文件名以正确显示中文
		let decodedName = fileName;
		try {
			decodedName = decodeURIComponent(fileName);
		} catch (e) {
			// 如果解码失败，使用原文件名
			decodedName = fileName;
		}
		
		if (showFileExtension) {
			return decodedName;
		}
		const lastDotIndex = decodedName.lastIndexOf('.');
		return lastDotIndex > 0 ? decodedName.substring(0, lastDotIndex) : decodedName;
	};

	// 验证文件
	const validateFile = (file: File): string | null => {
		// 检查文件大小
		if (file.size > maxFileSize) {
			return `文件大小超过限制 (${formatFileSize(maxFileSize)})`;
		}

		// 检查文件类型
		const isValidType = acceptedTypes.some((type) => {
			if (type.endsWith('/*')) {
				const category = type.split('/')[0];
				return file.type.startsWith(category + '/');
			}
			return file.type === type;
		});

		if (!isValidType) {
			return `不支持的文件类型: ${file.type}`;
		}

		return null;
	};

	// 上传文件
	const uploadFiles = async (files: FileList) => {
		setError(null);
		setUploading(true);
		setUploadProgress(0);

		try {
			const validFiles: File[] = [];

			// 验证所有文件
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const validationError = validateFile(file);
				if (validationError) {
					throw new Error(validationError);
				}
				validFiles.push(file);
			}

			const formData = new FormData();

			if (multiple) {
				validFiles.forEach((file) => {
					formData.append('files', file);
				});
			} else {
				formData.append('file', validFiles[0]);
			}

			// 添加分类信息
			if (showCategorySelect) {
				formData.append('category', selectedCategory);
			}

			const endpoint = multiple ? `${apiUrl}/multiple` : `${apiUrl}/single`;
			const headers: HeadersInit = {};

			if (authToken) {
				headers.Authorization = `Bearer ${authToken}`;
			}

			const response = await fetch(endpoint, {
				method: 'POST',
				body: formData,
				headers,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || '上传失败');
			}

			const newFiles = multiple ? result.data : [result.data];
			setUploadedFiles((prev) => [...prev, ...newFiles]);
			setUploadProgress(100);

			if (onUploadSuccess) {
				onUploadSuccess(newFiles);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : '上传失败';
			setError(errorMessage);
			if (onUploadError) {
				onUploadError(errorMessage);
			}
		} finally {
			setUploading(false);
			setUploadProgress(0);
		}
	};

	// 处理文件选择
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			addSelectedFiles(files);
		}
		// 清空input值，允许重复选择同一文件
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// 添加选中的文件
	const addSelectedFiles = (files: FileList) => {
		setError(null);
		const newSelectedFiles: SelectedFile[] = [];

		// 检查是否超过最大数量限制
		if (selectedFiles.length + files.length > maxFiles) {
			setError(`最多只能选择${maxFiles}张图片`);
			return;
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const validationError = validateFile(file);
			if (validationError) {
				setError(validationError);
				return;
			}

			// 为图片文件创建预览URL
			let previewUrl: string | undefined;
			if (file.type.startsWith('image/')) {
				previewUrl = URL.createObjectURL(file);
			}

			newSelectedFiles.push({ file, previewUrl });
		}

		if (multiple) {
			setSelectedFiles((prev) => [...prev, ...newSelectedFiles]);
		} else {
			// 单文件模式，替换之前的文件
			setSelectedFiles(newSelectedFiles);
		}
	};

	// 处理拖拽
	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = (event: React.DragEvent) => {
		event.preventDefault();
		setDragOver(false);
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		setDragOver(false);
		const files = event.dataTransfer.files;
		if (files && files.length > 0) {
			addSelectedFiles(files);
		}
	};

	// 删除选中的文件
	const removeSelectedFile = (index: number) => {
		setSelectedFiles((prev) => {
			const newFiles = prev.filter((_, i) => i !== index);
			// 释放预览URL
			if (prev[index].previewUrl) {
				URL.revokeObjectURL(prev[index].previewUrl!);
			}
			return newFiles;
		});
	};

	// 删除已上传的文件
	const removeUploadedFile = (index: number) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// 确认上传选中的文件
	const confirmUpload = async () => {
		if (selectedFiles.length === 0) return;

		const fileList = new DataTransfer();
		selectedFiles.forEach(({ file }) => {
			fileList.items.add(file);
		});

		await uploadFiles(fileList.files);

		// 清空选中的文件并释放预览URL
		selectedFiles.forEach(({ previewUrl }) => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		});
		setSelectedFiles([]);
	};

	// 清空所有选中的文件
	const clearSelectedFiles = () => {
		selectedFiles.forEach(({ previewUrl }) => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		});
		setSelectedFiles([]);
	};

	// 打开文件选择器
	const openFileSelector = () => {
		fileInputRef.current?.click();
	};

	return (
		<Box sx={{ width, height, mx: 'auto', p: 2 }}>
			{/* 分类选择器 */}
			{showCategorySelect && (
				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel>选择分类</InputLabel>
					<Select
						value={selectedCategory}
						onChange={(e) =>
							setSelectedCategory(
								e.target.value as 'official' | 'anime' | 'wallpaper' | 'fanart'
							)
						}
						label='选择分类'
						disabled={uploading}
					>
						<MenuItem value='official'>官方图片</MenuItem>
						<MenuItem value='anime'>动画截图</MenuItem>
						<MenuItem value='wallpaper'>壁纸</MenuItem>
						<MenuItem value='fanart'>同人作品</MenuItem>
					</Select>
				</FormControl>
			)}

			{/* 上传区域 - 只在没有选中文件时显示 */}
			{selectedFiles.length === 0 && (
				<Box
					onClick={openFileSelector}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					sx={{
						border: 2,
						borderColor: dragOver ? 'primary.main' : 'grey.300',
						borderStyle: 'dashed',
						borderRadius: 2,
						p: 3,
						textAlign: 'center',
						cursor: uploading ? 'not-allowed' : 'pointer',
						backgroundColor: dragOver ? 'primary.light' : 'grey.50',
						transition: 'all 0.3s ease',
						'&:hover': {
							borderColor: 'primary.main',
							backgroundColor: 'primary.light',
						},
						opacity: uploading ? 0.6 : 1,
					}}
				>
					<CloudUpload
						sx={{
							fontSize: 40,
							color: 'primary.main',
							mb: 1,
						}}
					/>
					<Typography variant='h6' gutterBottom>
						{uploading ? '上传中...' : '点击或拖拽文件到此处'}
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						支持 {acceptedTypes.join(', ')} 格式
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						最大文件大小: {formatFileSize(maxFileSize)}
					</Typography>
					{multiple && (
						<Chip
							label='支持多文件上传'
							size='small'
							color='primary'
							variant='outlined'
							sx={{ mt: 1 }}
						/>
					)}
				</Box>
			)}

			{/* 隐藏的文件输入 */}
			<input
				ref={fileInputRef}
				type='file'
				multiple={multiple}
				accept={acceptedTypes.join(',')}
				onChange={handleFileSelect}
				style={{ display: 'none' }}
				disabled={uploading}
			/>

			{/* 上传进度 */}
			{uploading && (
				<Box sx={{ mt: 2 }}>
					<LinearProgress
						variant='indeterminate'
						color='primary'
						sx={{ height: 8, borderRadius: 4 }}
					/>
					<Typography
						variant='body2'
						color='text.secondary'
						sx={{ mt: 1, textAlign: 'center' }}
					>
						正在上传文件...
					</Typography>
				</Box>
			)}

			{/* 错误信息 */}
			{error && (
				<Alert
					severity='error'
					icon={<ErrorIcon />}
					sx={{ mt: 2 }}
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			{/* 选中文件预览 */}
			{selectedFiles.length > 0 && (
				<Box sx={{ mt: 3 }}>
					<Typography variant='h6' gutterBottom>
						已选择文件 ({selectedFiles.length}/{maxFiles})
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
						{selectedFiles.map((selectedFile, index) => (
							<Box
								key={index}
								sx={{
									width: {
										xs: 'calc(50% - 8px)',
										sm: 'calc(33.33% - 11px)',
										md: 'calc(25% - 12px)',
									},
								}}
							>
								<Card sx={{ position: 'relative' }}>
									{selectedFile.previewUrl ? (
										showFileInfo ? (
											<Tooltip
												title={`${formatFileName(
													selectedFile.file.name
												)} (${formatFileSize(selectedFile.file.size)})`}
											>
												<CardMedia
													component='img'
													image={selectedFile.previewUrl}
													alt={selectedFile.file.name}
													sx={{
														height: previewImageHeight,
														objectFit: 'cover',
													}}
												/>
											</Tooltip>
										) : (
											<CardMedia
												component='img'
												image={selectedFile.previewUrl}
												alt={selectedFile.file.name}
												sx={{
													height: previewImageHeight,
													objectFit: 'cover',
												}}
											/>
										)
									) : (
										<Box
											sx={{
												height: previewImageHeight,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor: 'grey.100',
											}}
										>
											<Typography variant='body2' color='text.secondary'>
												{selectedFile.file.name}
											</Typography>
										</Box>
									)}
									<IconButton
										size='small'
										color='error'
										onClick={() => removeSelectedFile(index)}
										sx={{
											position: 'absolute',
											top: 4,
											right: 4,
											backgroundColor: 'rgba(255, 255, 255, 0.8)',
											'&:hover': {
												backgroundColor: 'rgba(255, 255, 255, 0.9)',
											},
										}}
									>
										{customDeleteIcon || <Close fontSize='small' />}
									</IconButton>
								</Card>
							</Box>
						))}
						{/* 添加更多图片按钮 */}
						{selectedFiles.length < maxFiles && (
							<Box
								sx={{
									width: {
										xs: 'calc(50% - 8px)',
										sm: 'calc(33.33% - 11px)',
										md: 'calc(25% - 12px)',
									},
								}}
							>
								<Card
									onClick={openFileSelector}
									sx={{
										height: previewImageHeight,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor: 'grey.100',
										cursor: 'pointer',
										border: 2,
										borderStyle: 'dashed',
										borderColor: 'grey.300',
										'&:hover': {
											borderColor: 'primary.main',
											backgroundColor: 'primary.light',
										},
									}}
								>
									<Typography variant='h3' color='primary.main'>
										+
									</Typography>
								</Card>
							</Box>
						)}
					</Box>
					<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
						<Button
							variant='contained'
							color='primary'
							startIcon={<Upload />}
							onClick={confirmUpload}
							disabled={uploading}
							sx={{ 
								minWidth: 150, 
								height: 48,
								fontSize: '1rem',
								fontWeight: 'bold'
							}}
						>
							{uploading ? '上传中...' : '确认上传'}
						</Button>
						<Button
							variant='outlined'
							color='secondary'
							onClick={clearSelectedFiles}
							disabled={uploading}
							sx={{ 
								minWidth: 120,
								height: 48,
								fontSize: '1rem'
							}}
						>
							清空
						</Button>
					</Box>
				</Box>
			)}

			{/* 已上传文件列表 */}
			{uploadedFiles.length > 0 && (
				<Box sx={{ mt: 3 }}>
					<Typography variant='h6' gutterBottom>
						已上传文件 ({uploadedFiles.length})
					</Typography>
					<List>
						{uploadedFiles.map((file, index) => (
							<ListItem
								key={index}
								sx={{
									border: 1,
									borderColor: 'grey.200',
									borderRadius: 1,
									mb: 1,
								}}
							>
								<CheckCircle color='success' sx={{ mr: 2 }} />
								<ListItemText
									primary={formatFileName(file.originalName)}
									secondary={`${formatFileSize(file.size)} • ${file.mimeType}`}
								/>
								<ListItem
									secondaryAction={
										<IconButton
											edge='end'
											color='error'
											onClick={() => removeUploadedFile(index)}
										>
											<Delete />
										</IconButton>
									}
								/>
							</ListItem>
						))}
					</List>
				</Box>
			)}
		</Box>
	);
};

export default FileUpload;
