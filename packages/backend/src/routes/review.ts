import Router from '@koa/router';
import { Context } from 'koa';
import { AppDataSource, isDatabaseConnected } from '../config/database';
import { authMiddleware } from './auth';
import { PendingImage } from '../entities/PendingImage';
import { Image } from '../entities/Image';
import { generateFileName, uploadToCOS } from '../config/cos';
import fs from 'fs';

const router = new Router({ prefix: '/api/review' });

// 应用认证中间件到所有审核路由
router.use(authMiddleware);

// 获取待审核图片列表
router.get('/pending', async (ctx: Context) => {
	try {
		const user = ctx.state.user;
		if (user.role !== 'admin') {
			ctx.status = 403;
			ctx.body = {
				success: false,
				message: '权限不足，仅管理员可访问',
			};
			return;
		}

		if (!isDatabaseConnected) {
			ctx.body = {
				success: true,
				data: {
					images: [],
					total: 0,
					page: 1,
					limit: 10,
					totalPages: 0,
				},
			};
			return;
		}

		const page = parseInt(ctx.query.page as string) || 1;
		const limit = parseInt(ctx.query.limit as string) || 10;
		const status = (ctx.query.status as string) || 'pending';
		const offset = (page - 1) * limit;

		const pendingImageRepository = AppDataSource.getRepository(PendingImage);

		// 获取待审核图片列表
		const [images, total] = await pendingImageRepository.findAndCount({
			where: { status: status as 'pending' | 'approved' | 'rejected' },
			relations: ['user'],
			order: { createdAt: 'DESC' },
			take: limit,
			skip: offset,
		});

		ctx.body = {
			success: true,
			data: {
				images: images.map((img) => ({
					id: img.id,
					title: img.title,
					description: img.description,
					url: img.url,
					category: img.category,
					originalFilename: img.originalFilename,
					fileSize: img.fileSize,
					mimeType: img.mimeType,
					status: img.status,
					rejectReason: img.rejectReason,
					user: {
						id: img.user.id,
						username: img.user.username,
						email: img.user.email,
					},
					createdAt: img.createdAt,
					reviewedAt: img.reviewedAt,
				})),
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		console.error('获取待审核图片失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

// 审核图片（通过或拒绝）
router.post('/approve/:id', async (ctx: Context) => {
	try {
		const user = ctx.state.user;
		if (user.role !== 'admin') {
			ctx.status = 403;
			ctx.body = {
				success: false,
				message: '权限不足，仅管理员可操作',
			};
			return;
		}

		if (!isDatabaseConnected) {
			ctx.body = {
				success: true,
				message: '演示模式：审核操作已模拟完成',
			};
			return;
		}

		const imageId = parseInt(ctx.params.id);
		const { action, rejectReason, category, title, description } = ctx.request
			.body as {
			action: 'approve' | 'reject';
			rejectReason?: string;
			category?: string;
			title?: string;
			description?: string;
		};

		const pendingImageRepository = AppDataSource.getRepository(PendingImage);
		const imageRepository = AppDataSource.getRepository(Image);

		// 查找待审核图片
		const pendingImage = await pendingImageRepository.findOne({
			where: { id: imageId },
			relations: ['user'],
		});

		if (!pendingImage) {
			ctx.status = 404;
			ctx.body = {
				success: false,
				message: '图片不存在',
			};
			return;
		}

		if (pendingImage.status !== 'pending') {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '该图片已经被审核过了',
			};
			return;
		}

		if (action === 'approve') {
			// 审核通过：将本地文件上传到腾讯云正式目录
			try {
				if (!pendingImage.localPath || !fs.existsSync(pendingImage.localPath)) {
					throw new Error('本地文件不存在');
				}

				// 生成正式文件名（使用审核时的分类或原分类）
				const finalCategory = (category as any) || pendingImage.category;
				const finalFileName = generateFileName(pendingImage.originalFilename, finalCategory);

				// 读取本地文件并上传到腾讯云正式目录
				const fileBuffer = fs.readFileSync(pendingImage.localPath);
				const finalUrl = await uploadToCOS(
					fileBuffer,
					finalFileName,
					pendingImage.mimeType
				);

				// 创建正式图片记录
				const newImage = imageRepository.create({
					title: title || pendingImage.title,
					description: description || pendingImage.description,
					url: finalUrl,
					category: (category as any) || pendingImage.category,
					tags: [],
					views: 0,
					likes: 0,
				});
				await imageRepository.save(newImage);

				// 更新待审核记录状态
				pendingImage.status = 'approved';
				pendingImage.url = finalUrl; // 更新为腾讯云URL
				pendingImage.reviewedById = user.id;
				pendingImage.reviewedAt = new Date();
				if (title) pendingImage.title = title;
				if (description) pendingImage.description = description;
				if (category) pendingImage.category = category as any;
				await pendingImageRepository.save(pendingImage);

				// 删除本地临时文件
				try {
					fs.unlinkSync(pendingImage.localPath);
				} catch (err) {
					console.warn('删除本地临时文件失败:', err);
				}

				ctx.body = {
					success: true,
					message: '图片审核通过，已添加到画廊',
					data: {
						imageId: newImage.id,
						url: finalUrl,
					},
				};
			} catch (error) {
				console.error('审核通过处理失败:', error);
				ctx.status = 500;
				ctx.body = {
					success: false,
					message: '审核处理失败',
				};
			}
		} else if (action === 'reject') {
			// 审核拒绝
			pendingImage.status = 'rejected';
			pendingImage.rejectReason = rejectReason || '不符合社区规范';
			pendingImage.reviewedById = user.id;
			pendingImage.reviewedAt = new Date();
			await pendingImageRepository.save(pendingImage);

			// 删除本地临时文件
			if (pendingImage.localPath && fs.existsSync(pendingImage.localPath)) {
				try {
					fs.unlinkSync(pendingImage.localPath);
				} catch (err) {
					console.warn('删除本地临时文件失败:', err);
				}
			}

			ctx.body = {
				success: true,
				message: '图片审核拒绝',
				data: {
					rejectReason: pendingImage.rejectReason,
				},
			};
		} else {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '无效的审核操作',
			};
		}
	} catch (error) {
		console.error('审核图片失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

// 获取审核统计信息
router.get('/stats', async (ctx: Context) => {
	try {
		const user = ctx.state.user;
		if (user.role !== 'admin') {
			ctx.status = 403;
			ctx.body = {
				success: false,
				message: '权限不足，仅管理员可访问',
			};
			return;
		}

		if (!isDatabaseConnected) {
			ctx.body = {
				success: true,
				data: {
					pending: 0,
					approved: 0,
					rejected: 0,
					total: 0,
				},
			};
			return;
		}

		const pendingImageRepository = AppDataSource.getRepository(PendingImage);

		const [pending, approved, rejected] = await Promise.all([
			pendingImageRepository.count({ where: { status: 'pending' } }),
			pendingImageRepository.count({ where: { status: 'approved' } }),
			pendingImageRepository.count({ where: { status: 'rejected' } }),
		]);

		ctx.body = {
			success: true,
			data: {
				pending,
				approved,
				rejected,
				total: pending + approved + rejected,
			},
		};
	} catch (error) {
		console.error('获取审核统计失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

export default router;
