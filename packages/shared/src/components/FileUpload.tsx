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
	ListItemSecondaryAction,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import {
	CloudUpload,
	Delete,
	CheckCircle,
	Error as ErrorIcon,
} from '@mui/icons-material';

interface UploadedFile {
	url: string;
	fileName: string;
	originalName: string;
	size: number;
	mimeType: string;
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
}

const FileUpload: React.FC<FileUploadProps> = ({
	multiple = false,
	acceptedTypes = ['image/*', 'video/*', 'audio/*'],
	maxFileSize = 10 * 1024 * 1024, // 10MB
	onUploadSuccess,
	onUploadError,
	authToken,
	apiUrl = 'http://localhost:3001/api/upload',
	showCategorySelect = false,
	defaultCategory = 'fanart',
}) => {
	// const { t } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [_uploadProgress, setUploadProgress] = useState(0);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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
			uploadFiles(files);
		}
		// 清空input值，允许重复选择同一文件
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
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
			uploadFiles(files);
		}
	};

	// 删除已上传的文件
	const removeUploadedFile = (index: number) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// 打开文件选择器
	const openFileSelector = () => {
		fileInputRef.current?.click();
	};

	return (
		<Box sx={{ width: '100%', maxWidth: 600 }}>
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

			{/* 上传区域 */}
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
					p: 4,
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
						fontSize: 48,
						color: 'primary.main',
						mb: 2,
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
									primary={file.originalName}
									secondary={`${formatFileSize(file.size)} • ${file.mimeType}`}
								/>
								<ListItemSecondaryAction>
									<IconButton
										edge='end'
										color='error'
										onClick={() => removeUploadedFile(index)}
									>
										<Delete />
									</IconButton>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				</Box>
			)}
		</Box>
	);
};

export default FileUpload;
