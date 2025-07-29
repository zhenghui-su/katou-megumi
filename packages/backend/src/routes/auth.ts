import Router from '@koa/router';
import { Context } from 'koa';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource, isDatabaseConnected } from '../config/database';
import { User } from '../entities/User';

const router = new Router({ prefix: '/api/auth' });

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'katou-megumi-secret-key';

// 注册
router.post('/register', async (ctx: Context) => {
	try {
		const { username, email, password } = ctx.request.body as {
			username: string;
			email: string;
			password: string;
		};

		// 验证输入
		if (!username || !email || !password) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '用户名、邮箱和密码都是必填项',
			};
			return;
		}

		if (!isDatabaseConnected) {
			// 模拟模式：直接返回成功
			ctx.status = 201;
			ctx.body = {
				success: true,
				message: '注册成功（演示模式）',
				data: {
					id: Math.floor(Math.random() * 1000),
					username,
					email,
				},
			};
			return;
		}

		// 使用TypeORM检查用户名是否已存在
		const userRepository = AppDataSource.getRepository(User);
		const existingUser = await userRepository.findOne({
			where: [
				{ username },
				{ email }
			]
		});

		if (existingUser) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '用户名或邮箱已存在',
			};
			return;
		}

		// 加密密码
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// 创建新用户
		const newUser = userRepository.create({
			username,
			email,
			password: hashedPassword,
		});

		const savedUser = await userRepository.save(newUser);

		ctx.status = 201;
		ctx.body = {
			success: true,
			message: '注册成功',
			data: {
				id: savedUser.id,
				username: savedUser.username,
				email: savedUser.email,
			},
		};
	} catch (error) {
		console.error('注册失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

// 登录
router.post('/login', async (ctx: Context) => {
	try {
		const { username, password } = ctx.request.body as {
			username: string;
			password: string;
		};

		// 验证输入
		if (!username || !password) {
			ctx.status = 400;
			ctx.body = {
				success: false,
				message: '用户名和密码都是必填项',
			};
			return;
		}

		if (!isDatabaseConnected) {
			// 模拟模式：使用演示账户
			if (username === 'admin' && password === 'admin123') {
				const token = jwt.sign(
					{
						id: 1,
						username: 'admin',
						role: 'admin',
					},
					JWT_SECRET,
					{ expiresIn: '24h' }
				);

				ctx.body = {
					success: true,
					message: '登录成功（演示模式）',
					data: {
						token,
						user: {
							id: 1,
							username: 'admin',
							email: 'admin@example.com',
							role: 'admin',
						},
					},
				};
				return;
			} else {
				ctx.status = 401;
				ctx.body = {
					success: false,
					message: '演示模式：请使用 admin/admin123 登录',
				};
				return;
			}
		}

		// 使用TypeORM查找用户
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOne({
			where: [
				{ username },
				{ email: username }
			]
		});

		if (!user) {
			ctx.status = 401;
			ctx.body = {
				success: false,
				message: '用户名或密码错误',
			};
			return;
		}

		// 检查用户状态
		if (user.status !== 'active') {
			ctx.status = 401;
			ctx.body = {
				success: false,
				message: '账户已被禁用',
			};
			return;
		}

		// 验证密码
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			ctx.status = 401;
			ctx.body = {
				success: false,
				message: '用户名或密码错误',
			};
			return;
		}

		// 生成JWT token
		const token = jwt.sign(
			{
				id: user.id,
				username: user.username,
				role: user.role,
			},
			JWT_SECRET,
			{ expiresIn: '24h' }
		);

		ctx.body = {
			success: true,
			message: '登录成功',
			data: {
				token,
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.role,
				},
			},
		};
	} catch (error) {
		console.error('登录失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '服务器内部错误',
		};
	}
});

// 验证token中间件
export const authMiddleware = async (
	ctx: Context,
	next: () => Promise<any>
) => {
	try {
		const authHeader = ctx.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			ctx.status = 401;
			ctx.body = {
				success: false,
				message: '未提供认证token',
			};
			return;
		}

		const token = authHeader.substring(7);
		const decoded = jwt.verify(token, JWT_SECRET) as any;

		// 将用户信息添加到context
		ctx.state.user = decoded;
		await next();
	} catch (error: any) {
		ctx.status = 401;
		ctx.body = {
				success: false,
				message: 'token无效或已过期',
			};
	}
};

export default router;
