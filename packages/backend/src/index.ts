import 'dotenv/config';
import Koa from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import path from 'path';
import { initDatabase } from './config/database';
import { galleryRouter } from './routes/gallery';
import { videosRouter } from './routes/videos';
import { worksRouter } from './routes/works';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';

const app = new Koa();
const router = new Router();

// 中间件配置
app.use(
	cors({
		origin: '*', // 开发环境允许所有来源，生产环境应该限制
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
	})
);

app.use(
	koaBody({
		multipart: true,
		formidable: {
			maxFileSize: 10 * 1024 * 1024, // 10MB
		},
	})
);

// 静态文件服务
app.use(koaStatic(path.join(__dirname, '../public')));

// 基础路由
router.get('/', async (ctx) => {
	ctx.body = {
			message: '加藤惠粉丝网站 API 服务',
			version: '1.0.0',
			endpoints: {
				gallery: '/api/gallery',
				videos: '/api/videos',
				works: '/api/works',
				auth: '/api/auth',
				admin: '/api/admin',
				upload: '/api/upload',
			},
			features: {
				cos: '腾讯云对象存储支持',
				auth: 'JWT身份认证',
				fileUpload: '文件上传服务',
			},
		};
});

router.get('/health', async (ctx) => {
	ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
});

// API 路由
app.use(router.routes());
app.use(router.allowedMethods());
app.use(galleryRouter.routes());
app.use(galleryRouter.allowedMethods());
app.use(videosRouter.routes());
app.use(videosRouter.allowedMethods());
app.use(worksRouter.routes());
app.use(worksRouter.allowedMethods());
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());
app.use(adminRoutes.routes());
app.use(adminRoutes.allowedMethods());
app.use(uploadRoutes.routes());
app.use(uploadRoutes.allowedMethods());

// 错误处理
app.on('error', (err, ctx) => {
	console.error('Server error:', err);
});

const PORT = process.env.PORT || 3001;

// 启动服务器
const startServer = async () => {
	try {
		// 初始化数据库
		await initDatabase();

		// 启动服务器
		app.listen(PORT, () => {
			console.log(`🚀 加藤惠 API 服务器运行在 http://localhost:${PORT}`);
			console.log(`📚 API 文档: http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('服务器启动失败:', error);
		process.exit(1);
	}
};

startServer();

export default app;
