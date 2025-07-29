import Router from '@koa/router';
import { Context } from 'koa';
import { uploadToCOS, generateFileName, isCOSConfigured } from '../config/cos';
import { authMiddleware } from './auth';

const router = new Router({ prefix: '/api/upload' });

// 允许的文件类型
const allowedTypes = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'video/mp4',
	'video/webm',
	'audio/mp3',
	'audio/wav',
	'audio/ogg',
];

// 验证文件类型
const validateFileType = (mimetype: string): boolean => {
	return allowedTypes.includes(mimetype);
};

// 单文件上传接口（需要认证）
router.post('/single', authMiddleware, async (ctx: Context) => {
	try {
		if (!isCOSConfigured()) {
			ctx.status = 500;
			ctx.body = {
				success: false,
				message: 'COS服务未配置，请联系管理员',
			};
			return;
		}

		const files = ctx.request.files;
		if (!files || !files.file) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '请选择要上传的文件',
			};
			return;
		}

		const file = Array.isArray(files.file) ? files.file[0] : files.file;
		
		// 验证文件类型
		if (!validateFileType(file.mimetype || '')) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '不支持的文件类型',
			};
			return;
		}

		// 生成唯一文件名
		const fileName = generateFileName(file.originalFilename || file.newFilename);

		// 读取文件内容
		const fs = await import('fs');
		const fileBuffer = fs.readFileSync(file.filepath);

		// 上传到COS
		const fileUrl = await uploadToCOS(fileBuffer, fileName, file.mimetype || 'application/octet-stream');

		ctx.body = {
			success: true,
			message: '文件上传成功',
			data: {
				url: fileUrl,
				fileName: fileName,
				originalName: file.originalFilename || file.newFilename,
				size: file.size,
				mimeType: file.mimetype || 'application/octet-stream',
			},
		};
	} catch (error) {
		console.error('文件上传错误:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: error instanceof Error ? error.message : '文件上传失败',
		};
	} finally {
		// 清理临时文件
		if (ctx.request.files) {
			const fs = await import('fs');
			const files = ctx.request.files;
			for (const key in files) {
				const file = Array.isArray(files[key]) ? files[key][0] : files[key];
				if (file && file.filepath) {
					try {
						fs.unlinkSync(file.filepath);
					} catch (err) {
						console.warn('清理临时文件失败:', err);
					}
				}
			}
		}
	}
});

// 多文件上传接口（需要认证）
router.post('/multiple', authMiddleware, async (ctx: Context) => {
	try {
		if (!isCOSConfigured()) {
			ctx.status = 500;
			ctx.body = {
				success: false,
				message: 'COS服务未配置，请联系管理员',
			};
			return;
		}

		const requestFiles = ctx.request.files;
		if (!requestFiles || !requestFiles.files) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '请选择要上传的文件',
			};
			return;
		}

		const files = Array.isArray(requestFiles.files) ? requestFiles.files : [requestFiles.files];
		
		// 验证所有文件类型
		for (const file of files) {
			if (!validateFileType(file.mimetype || '')) {
				ctx.status = 400;
				ctx.body = {
					success: false,
					message: `不支持的文件类型: ${file.mimetype}`,
				};
				return;
			}
		}

		// 批量上传文件
		const fs = await import('fs');
		const uploadPromises = files.map(async (file) => {
			const fileName = generateFileName(file.originalFilename || file.newFilename);
			const fileBuffer = fs.readFileSync(file.filepath);
			const fileUrl = await uploadToCOS(fileBuffer, fileName, file.mimetype || 'application/octet-stream');
			return {
				url: fileUrl,
				fileName: fileName,
				originalName: file.originalFilename || file.newFilename,
				size: file.size,
				mimeType: file.mimetype || 'application/octet-stream',
			};
		});

		const uploadResults = await Promise.all(uploadPromises);

		ctx.body = {
			success: true,
			message: `成功上传${uploadResults.length}个文件`,
			data: uploadResults,
		};
	} catch (error) {
		console.error('批量文件上传错误:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: error instanceof Error ? error.message : '文件上传失败',
		};
	} finally {
		// 清理临时文件
		if (ctx.request.files) {
			const fs = await import('fs');
			const files = ctx.request.files;
			for (const key in files) {
				const fileList = Array.isArray(files[key]) ? files[key] : [files[key]];
				for (const file of fileList) {
					if (file && file.filepath) {
						try {
							fs.unlinkSync(file.filepath);
						} catch (err) {
							console.warn('清理临时文件失败:', err);
						}
					}
				}
			}
		}
	}
});

// 单文件上传接口（无需认证）
router.post('/public/single', async (ctx: Context) => {
	try {
		if (!isCOSConfigured()) {
			ctx.status = 500;
			ctx.body = {
				success: false,
				message: 'COS服务未配置，请联系管理员',
			};
			return;
		}

		const files = ctx.request.files;
		if (!files || !files.file) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '请选择要上传的文件',
			};
			return;
		}

		const file = Array.isArray(files.file) ? files.file[0] : files.file;
		
		// 验证文件类型
		if (!validateFileType(file.mimetype || '')) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '不支持的文件类型',
			};
			return;
		}

		// 生成唯一文件名
		const fileName = generateFileName(file.originalFilename || file.newFilename);

		// 读取文件内容
		const fs = await import('fs');
		const fileBuffer = fs.readFileSync(file.filepath);

		// 上传到COS
		const fileUrl = await uploadToCOS(fileBuffer, fileName, file.mimetype || 'application/octet-stream');

		ctx.body = {
			success: true,
			message: '文件上传成功',
			data: {
				url: fileUrl,
				fileName: fileName,
				originalName: file.originalFilename || file.newFilename,
				size: file.size,
				mimeType: file.mimetype || 'application/octet-stream',
			},
		};
	} catch (error) {
		console.error('文件上传错误:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: error instanceof Error ? error.message : '文件上传失败',
		};
	} finally {
		// 清理临时文件
		if (ctx.request.files) {
			const fs = await import('fs');
			const files = ctx.request.files;
			for (const key in files) {
				const file = Array.isArray(files[key]) ? files[key][0] : files[key];
				if (file && file.filepath) {
					try {
						fs.unlinkSync(file.filepath);
					} catch (err) {
						console.warn('清理临时文件失败:', err);
					}
				}
			}
		}
	}
});

// 多文件上传接口（无需认证）
router.post('/public/multiple', async (ctx: Context) => {
	try {
		if (!isCOSConfigured()) {
			ctx.status = 500;
			ctx.body = {
				success: false,
				message: 'COS服务未配置，请联系管理员',
			};
			return;
		}

		const requestFiles = ctx.request.files;
		if (!requestFiles || !requestFiles.files) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '请选择要上传的文件',
			};
			return;
		}

		const files = Array.isArray(requestFiles.files) ? requestFiles.files : [requestFiles.files];
		
		// 验证所有文件类型
		for (const file of files) {
			if (!validateFileType(file.mimetype || '')) {
				ctx.status = 400;
				ctx.body = {
					success: false,
					message: `不支持的文件类型: ${file.mimetype}`,
				};
				return;
			}
		}

		// 批量上传文件
		const fs = await import('fs');
		const uploadPromises = files.map(async (file) => {
			const fileName = generateFileName(file.originalFilename || file.newFilename);
			const fileBuffer = fs.readFileSync(file.filepath);
			const fileUrl = await uploadToCOS(fileBuffer, fileName, file.mimetype || 'application/octet-stream');
			return {
				url: fileUrl,
				fileName: fileName,
				originalName: file.originalFilename || file.newFilename,
				size: file.size,
				mimeType: file.mimetype || 'application/octet-stream',
			};
		});

		const uploadResults = await Promise.all(uploadPromises);

		ctx.body = {
			success: true,
			message: `成功上传${uploadResults.length}个文件`,
			data: uploadResults,
		};
	} catch (error) {
		console.error('批量文件上传错误:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: error instanceof Error ? error.message : '文件上传失败',
		};
	} finally {
		// 清理临时文件
		if (ctx.request.files) {
			const fs = await import('fs');
			const files = ctx.request.files;
			for (const key in files) {
				const fileList = Array.isArray(files[key]) ? files[key] : [files[key]];
				for (const file of fileList) {
					if (file && file.filepath) {
						try {
							fs.unlinkSync(file.filepath);
						} catch (err) {
							console.warn('清理临时文件失败:', err);
						}
					}
				}
			}
		}
	}
});

// 获取上传配置信息（不需要认证）
router.get('/config', async (ctx: Context) => {
	ctx.body = {
		success: true,
		data: {
			maxFileSize: 10 * 1024 * 1024, // 10MB
			allowedTypes: [
				'image/jpeg',
				'image/png',
				'image/gif',
				'image/webp',
				'video/mp4',
				'video/webm',
				'audio/mp3',
				'audio/wav',
				'audio/ogg',
			],
			cosConfigured: isCOSConfigured(),
		},
	};
});

export default router;
