import Router from '@koa/router';
import { Context } from 'koa';

const router = new Router({ prefix: '/api/videos' });

// 模拟视频数据
const videosData = [
	{
		id: 1,
		title: '加藤惠精彩片段 1',
		description: '时长精选剪辑',
		url: 'https://example.com/videos/megumi_clip1.mp4',
		thumbnail: 'https://example.com/videos/thumbs/megumi_clip1.jpg',
		duration: '03:45',
		views: 12580,
		likes: 1024,
		tags: ['精彩片段', '剪辑', '经典'],
		uploadDate: '2024-01-15',
	},
	{
		id: 2,
		title: '加藤惠精彩片段 2',
		description: '经典作品剪辑',
		url: 'https://example.com/videos/megumi_clip2.mp4',
		thumbnail: 'https://example.com/videos/thumbs/megumi_clip2.jpg',
		duration: '05:20',
		views: 8960,
		likes: 756,
		tags: ['经典', '作品剪辑', '回忆'],
		uploadDate: '2024-01-10',
	},
	{
		id: 3,
		title: '加藤惠精彩片段 3',
		description: '经典作品剪辑',
		url: 'https://example.com/videos/megumi_clip3.mp4',
		thumbnail: 'https://example.com/videos/thumbs/megumi_clip3.jpg',
		duration: '04:12',
		views: 15420,
		likes: 1356,
		tags: ['精选', '高光时刻', '感动'],
		uploadDate: '2024-01-20',
	},
];

// 获取所有视频列表
router.get('/', async (ctx: Context) => {
	const { page = 1, limit = 10, sort = 'uploadDate' } = ctx.query;

	let sortedData = [...videosData];

	// 排序
	if (sort === 'views') {
		sortedData.sort((a, b) => b.views - a.views);
	} else if (sort === 'likes') {
		sortedData.sort((a, b) => b.likes - a.likes);
	} else {
		sortedData.sort(
			(a, b) =>
				new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
		);
	}

	const startIndex = (Number(page) - 1) * Number(limit);
	const endIndex = startIndex + Number(limit);
	const paginatedData = sortedData.slice(startIndex, endIndex);

	ctx.body = {
		success: true,
		data: {
			videos: paginatedData,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total: videosData.length,
				totalPages: Math.ceil(videosData.length / Number(limit)),
			},
		},
	};
});

// 获取单个视频详情
router.get('/:id', async (ctx: Context) => {
	const { id } = ctx.params;
	const video = videosData.find((v) => v.id === Number(id));

	if (!video) {
		ctx.status = 404;
		ctx.body = {
			success: false,
			message: '视频不存在',
		};
		return;
	}

	ctx.body = {
		success: true,
		data: video,
	};
});

// 获取推荐视频
router.get('/recommended/:id', async (ctx: Context) => {
	const { id } = ctx.params;
	const currentVideo = videosData.find((v) => v.id === Number(id));

	if (!currentVideo) {
		ctx.status = 404;
		ctx.body = {
			success: false,
			message: '视频不存在',
		};
		return;
	}

	// 简单的推荐算法：排除当前视频，按观看量排序
	const recommended = videosData
		.filter((v) => v.id !== Number(id))
		.sort((a, b) => b.views - a.views)
		.slice(0, 3);

	ctx.body = {
		success: true,
		data: {
			recommended,
		},
	};
});

export { router as videosRouter };
