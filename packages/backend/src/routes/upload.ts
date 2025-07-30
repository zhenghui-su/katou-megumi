import Router from '@koa/router';
import { Context } from 'koa';
import { uploadToCOS, generateFileName, isCOSConfigured } from '../config/cos';
import { authMiddleware } from './auth';
import { AppDataSource, isDatabaseConnected } from '../config/database';
import { PendingImage } from '../entities/PendingImage';
import path from 'path';
import fs from 'fs';

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

// 单文件上传接口（需要认证）- 提交审核
router.post('/single', authMiddleware, async (ctx: Context) => {
	try {
		const user = ctx.state.user;
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

		// 只验证图片类型用于审核
		if (!file.mimetype?.startsWith('image/')) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '审核功能仅支持图片文件',
			};
			return;
		}

		// 获取分类信息
		const category = (ctx.request.body as any)?.category || 'fanart';
		
		// 生成唯一文件名
		const fileName = generateFileName(file.originalFilename || file.newFilename, category);

		// 创建临时存储目录
		const tempDir = path.join(process.cwd(), 'temp', 'pending-images');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		// 立即读取文件内容（在 koa-body 清理前）
		let fileBuffer: Buffer;
		try {
			fileBuffer = fs.readFileSync(file.filepath);
		} catch (error) {
			console.error('读取文件失败:', error);
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '文件读取失败',
			};
			return;
		}

		// 写入到我们的临时目录
		const tempFilePath = path.join(tempDir, fileName);
		// 确保文件所在的子目录存在
		const fileDir = path.dirname(tempFilePath);
		if (!fs.existsSync(fileDir)) {
			fs.mkdirSync(fileDir, { recursive: true });
		}
		try {
			fs.writeFileSync(tempFilePath, fileBuffer);
		} catch (error) {
			console.error('写入文件失败:', error);
			ctx.status = 500;
			ctx.body = {
				success: false,
				message: '文件处理失败',
			};
			return;
		}

		// 生成临时访问URL（本地文件服务）
		const tempFileUrl = `http://localhost:3001/temp/pending-images/${fileName}`;

		// 保存到待审核表
		if (isDatabaseConnected) {
			const pendingImageRepository = AppDataSource.getRepository(PendingImage);
			const pendingImage = pendingImageRepository.create({
				title: file.originalFilename || file.newFilename,
				url: tempFileUrl,
				category: category as 'official' | 'anime' | 'wallpaper' | 'fanart',
				originalFilename: file.originalFilename || file.newFilename,
				fileSize: file.size,
				mimeType: file.mimetype || 'application/octet-stream',
				userId: user.id,
				status: 'pending',
				localPath: tempFilePath // 保存本地文件路径
			});
			await pendingImageRepository.save(pendingImage);
		}

		ctx.body = {
			success: true,
			message: '文件已提交审核，审核通过后将显示在画廊中',
			data: {
				fileName: fileName,
				originalName: file.originalFilename || file.newFilename,
				size: file.size,
				mimeType: file.mimetype || 'application/octet-stream',
				status: 'pending'
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

// 多文件上传接口（需要认证）- 提交审核
router.post('/multiple', authMiddleware, async (ctx: Context) => {
	try {
		const user = ctx.state.user;
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
			// 只验证图片类型用于审核
			if (!file.mimetype?.startsWith('image/')) {
				ctx.status = 400;
				ctx.body = {
					success: false,
					message: '审核功能仅支持图片文件',
				};
				return;
			}
		}

		// 获取分类信息
		const category = (ctx.request.body as any)?.category || 'fanart';
		
		// 创建临时存储目录
		const tempDir = path.join(process.cwd(), 'temp', 'pending-images');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		// 批量处理文件到本地临时目录并保存到待审核表
		const uploadPromises = files.map(async (file) => {
			const fileName = generateFileName(file.originalFilename || file.newFilename, category);
			
			// 立即读取文件内容（在 koa-body 清理前）
			let fileBuffer: Buffer;
			try {
				fileBuffer = fs.readFileSync(file.filepath);
			} catch (error) {
				console.error('读取文件失败:', error);
				throw new Error(`文件读取失败: ${file.originalFilename || file.newFilename}`);
			}
			
			// 写入到我们的临时目录
			const tempFilePath = path.join(tempDir, fileName);
			// 确保文件所在的子目录存在
			const fileDir = path.dirname(tempFilePath);
			if (!fs.existsSync(fileDir)) {
				fs.mkdirSync(fileDir, { recursive: true });
			}
			try {
				fs.writeFileSync(tempFilePath, fileBuffer);
			} catch (error) {
				console.error('写入文件失败:', error);
				throw new Error(`文件处理失败: ${file.originalFilename || file.newFilename}`);
			}
			
			// 生成临时访问URL（本地文件服务）
			const tempFileUrl = `http://localhost:3001/temp/pending-images/${fileName}`;
			
			// 保存到待审核表
			if (isDatabaseConnected) {
				const pendingImageRepository = AppDataSource.getRepository(PendingImage);
				const pendingImage = pendingImageRepository.create({
					title: file.originalFilename || file.newFilename,
					url: tempFileUrl,
					category: category as 'official' | 'anime' | 'wallpaper' | 'fanart',
					originalFilename: file.originalFilename || file.newFilename,
					fileSize: file.size,
					mimeType: file.mimetype || 'application/octet-stream',
					userId: user.id,
					status: 'pending',
					localPath: tempFilePath // 保存本地文件路径
				});
				await pendingImageRepository.save(pendingImage);
			}
			
			return {
				fileName: fileName,
				originalName: file.originalFilename || file.newFilename,
				size: file.size,
				mimeType: file.mimetype || 'application/octet-stream',
				status: 'pending'
			};
		});

		const uploadResults = await Promise.all(uploadPromises);

		ctx.body = {
			success: true,
			message: `成功提交${uploadResults.length}个文件审核，审核通过后将显示在画廊中`,
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
