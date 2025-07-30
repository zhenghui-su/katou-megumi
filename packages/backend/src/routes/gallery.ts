import Router from '@koa/router';
import { Context } from 'koa';
import { AppDataSource, isDatabaseConnected } from '../config/database';
import { Image } from '../entities/Image';

const router = new Router({ prefix: '/api/gallery' });

// 模拟图片数据
const galleryData = {
	official: [
		{
			id: 1,
			title: '加藤惠官方立绘1',
			url: 'https://example.com/images/official/megumi1.jpg',
			thumbnail: 'https://example.com/images/official/thumb/megumi1.jpg',
			description: '官方发布的高质量角色立绘',
			tags: ['官方', '立绘', '高清'],
		},
		{
			id: 2,
			title: '加藤惠官方立绘2',
			url: 'https://example.com/images/official/megumi2.jpg',
			thumbnail: 'https://example.com/images/official/thumb/megumi2.jpg',
			description: '官方发布的角色设定图',
			tags: ['官方', '设定图', '高清'],
		},
	],
	anime: [
		{
			id: 3,
			title: '动画截图1',
			url: 'https://example.com/images/anime/scene1.jpg',
			thumbnail: 'https://example.com/images/anime/thumb/scene1.jpg',
			description: '第一季精彩场景截图',
			tags: ['动画', '截图', '第一季'],
		},
		{
			id: 4,
			title: '动画截图2',
			url: 'https://example.com/images/anime/scene2.jpg',
			thumbnail: 'https://example.com/images/anime/thumb/scene2.jpg',
			description: '第二季经典场景',
			tags: ['动画', '截图', '第二季'],
		},
	],
	wallpaper: [
		{
			id: 5,
			title: '加藤惠壁纸1',
			url: 'https://example.com/images/wallpaper/wp1.jpg',
			thumbnail: 'https://example.com/images/wallpaper/thumb/wp1.jpg',
			description: '1920x1080高清壁纸',
			tags: ['壁纸', '高清', '1920x1080'],
		},
		{
			id: 6,
			title: '加藤惠壁纸2',
			url: 'https://example.com/images/wallpaper/wp2.jpg',
			thumbnail: 'https://example.com/images/wallpaper/thumb/wp2.jpg',
			description: '4K超高清壁纸',
			tags: ['壁纸', '4K', '超高清'],
		},
	],
	fanart: [
		{
			id: 7,
			title: '同人作品1',
			url: 'https://example.com/images/fanart/fan1.jpg',
			thumbnail: 'https://example.com/images/fanart/thumb/fan1.jpg',
			description: '粉丝创作的精美同人图',
			tags: ['同人', '粉丝作品', '精美'],
		},
		{
			id: 8,
			title: '同人作品2',
			url: 'https://example.com/images/fanart/fan2.jpg',
			thumbnail: 'https://example.com/images/fanart/thumb/fan2.jpg',
			description: '社区优秀同人创作',
			tags: ['同人', '社区作品', '创作'],
		},
	],
};

// 获取所有已通过审核的图片
router.get('/', async (ctx: Context) => {
	try {
		if (!isDatabaseConnected) {
			ctx.status = 500;
			ctx.body = {
				success: false,
				message: '数据库连接失败',
			};
			return;
		}

		const imageRepository = AppDataSource.getRepository(Image);
		const images = await imageRepository.find({
			order: {
				createdAt: 'DESC',
			},
		});

		ctx.body = {
			success: true,
			data: images,
			total: images.length,
		};
	} catch (error) {
		console.error('获取图片列表失败:', error);
		ctx.status = 500;
		ctx.body = {
			success: false,
			message: '获取图片列表失败',
		};
	}
});

// 获取指定分类的图片
router.get('/:category', async (ctx: Context) => {
	const { category } = ctx.params;
	const { page = 1, limit = 10 } = ctx.query;

	if (!galleryData[category as keyof typeof galleryData]) {
		ctx.status = 404;
		ctx.body = {
			success: false,
			message: '分类不存在',
		};
		return;
	}

	const data = galleryData[category as keyof typeof galleryData];
	const startIndex = (Number(page) - 1) * Number(limit);
	const endIndex = startIndex + Number(limit);
	const paginatedData = data.slice(startIndex, endIndex);

	ctx.body = {
		success: true,
		data: {
			category,
			images: paginatedData,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total: data.length,
				totalPages: Math.ceil(data.length / Number(limit)),
			},
		},
	};
});

// 获取单张图片详情
router.get('/:category/:id', async (ctx: Context) => {
	const { category, id } = ctx.params;

	if (!galleryData[category as keyof typeof galleryData]) {
		ctx.status = 404;
		ctx.body = {
			success: false,
			message: '分类不存在',
		};
		return;
	}

	const data = galleryData[category as keyof typeof galleryData];
	const image = data.find((item) => item.id === Number(id));

	if (!image) {
		ctx.status = 404;
		ctx.body = {
			success: false,
			message: '图片不存在',
		};
		return;
	}

	ctx.body = {
		success: true,
		data: image,
	};
});

export { router as galleryRouter };
