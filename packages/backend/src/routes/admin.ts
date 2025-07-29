import Router from '@koa/router';
import { Context } from 'koa';
import { AppDataSource, isDatabaseConnected } from '../config/database';
import { authMiddleware } from './auth';
import { User } from '../entities/User';
import { Image } from '../entities/Image';
import { Video } from '../entities/Video';
import { SiteStats } from '../entities/SiteStats';

const router = new Router({ prefix: '/api/admin' });

// 应用认证中间件到所有管理路由
router.use(authMiddleware);

// 获取仪表板统计数据
router.get('/stats', async (ctx: Context) => {
	try {
		// 检查用户权限（可选：只允许管理员访问）
		const user = ctx.state.user;
		if (user.role !== 'admin') {
			ctx.status = 403;
			ctx.body = {
				success: false,
				message: '权限不足',
			};
			return;
		}

		if (!isDatabaseConnected) {
			// 模拟模式：返回演示数据
			ctx.body = {
				success: true,
				data: {
					totalUsers: 156,
					totalImages: 89,
					totalVideos: 23,
					totalViews: 12580,
				},
			};
			return;
		}

		// 使用TypeORM获取统计数据
		const userRepository = AppDataSource.getRepository(User);
		const imageRepository = AppDataSource.getRepository(Image);
		const videoRepository = AppDataSource.getRepository(Video);
		const statsRepository = AppDataSource.getRepository(SiteStats);

		// 获取用户总数
		const totalUsers = await userRepository.count({ where: { status: 'active' } });

		// 获取图片总数
		const totalImages = await imageRepository.count();

		// 获取视频总数
		const totalVideos = await videoRepository.count();

		// 获取总访问量（从统计表）
		const statsResult = await statsRepository
			.createQueryBuilder('stats')
			.select('SUM(stats.pageViews)', 'totalViews')
			.getRawOne();
		const totalViews = parseInt(statsResult?.totalViews) || 0;

		ctx.body = {
			success: true,
			data: {
				totalUsers,
				totalImages,
				totalVideos,
				totalViews,
			},
		};
	} catch (error) {
		console.error('获取统计数据失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

// 获取用户列表
router.get('/users', async (ctx: Context) => {
	try {
		const user = ctx.state.user;
		if (user.role !== 'admin') {
			ctx.status = 403;
			ctx.body = {
				success: false,
				message: '权限不足',
			};
			return;
		}

		const page = parseInt(ctx.query.page as string) || 1;
		const limit = parseInt(ctx.query.limit as string) || 10;
		const offset = (page - 1) * limit;

		// 使用TypeORM获取用户列表
		const userRepository = AppDataSource.getRepository(User);
		
		// 获取用户列表
		const [users, total] = await userRepository.findAndCount({
			select: ['id', 'username', 'email', 'role', 'status', 'createdAt'],
			order: { createdAt: 'DESC' },
			take: limit,
			skip: offset
		});

		ctx.body = {
			success: true,
			data: {
				users,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		console.error('获取用户列表失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

// 更新用户状态
router.put('/users/:id/status', async (ctx: Context) => {
	try {
		const user = ctx.state.user;
		if (user.role !== 'admin') {
			ctx.status = 403;
			ctx.body = {
				success: false,
				message: '权限不足',
			};
			return;
		}

		const userId = parseInt(ctx.params.id);
		const { status } = ctx.request.body as { status: string };

		if (!['active', 'inactive'].includes(status)) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '无效的状态值',
			};
			return;
		}

		// 使用TypeORM更新用户状态
		const userRepository = AppDataSource.getRepository(User);
		await userRepository.update(userId, { status: status as 'active' | 'inactive' });

		ctx.body = {
			success: true,
			message: '用户状态更新成功',
		};
	} catch (error) {
		console.error('更新用户状态失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

// 删除用户
router.delete('/users/:id', async (ctx: Context) => {
	try {
		const user = ctx.state.user;
		if (user.role !== 'admin') {
			ctx.status = 403;
			ctx.body = {
				success: false,
				message: '权限不足',
			};
			return;
		}

		const userId = parseInt(ctx.params.id);

		// 防止删除自己
		if (userId === user.id) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '不能删除自己的账户',
			};
			return;
		}

		// 使用TypeORM删除用户
		const userRepository = AppDataSource.getRepository(User);
		await userRepository.delete(userId);

		ctx.body = {
			success: true,
			message: '用户删除成功',
		};
	} catch (error) {
		console.error('删除用户失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

export default router;
