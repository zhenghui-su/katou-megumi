import Router from '@koa/router';
import { Context } from 'koa';

const router = new Router({ prefix: '/api/works' });

// 模拟相关作品数据
const worksData = [
	{
		id: 1,
		title: '路人女主的养成方法',
		subtitle: '动画 第一季',
		description: '介绍了解这位似平凡却充满魅力的女主角',
		year: '2015年',
		type: 'TV动画',
		episodes: 12,
		status: '已完结',
		poster: 'https://example.com/posters/saekano_s1.jpg',
		thumbnail: 'https://example.com/thumbs/saekano_s1.jpg',
		rating: 8.5,
		genres: ['恋爱', '校园', '日常'],
		studio: 'A-1 Pictures',
		director: '亀井幹太',
		releaseDate: '2015-01-09',
		watchUrl: 'https://example.com/watch/saekano-s1',
	},
	{
		id: 2,
		title: '路人女主的养成方法♭',
		subtitle: 'TV动画 第二季',
		description:
			'2017年播出的第二季，故事更加深入，加藤惠的魅力得到了更好的展现。',
		year: '2017年',
		type: 'TV动画',
		episodes: 11,
		status: '已完结',
		poster: 'https://example.com/posters/saekano_s2.jpg',
		thumbnail: 'https://example.com/thumbs/saekano_s2.jpg',
		rating: 8.8,
		genres: ['恋爱', '校园', '日常'],
		studio: 'A-1 Pictures',
		director: '亀井幹太',
		releaseDate: '2017-04-14',
		watchUrl: 'https://example.com/watch/saekano-s2',
	},
	{
		id: 3,
		title: '路人女主的养成方法 Fine',
		subtitle: '剧场版',
		description: '2019年上映的剧场版，为整个系列画下了完美的句号。',
		year: '2019年',
		type: '剧场版',
		episodes: 1,
		status: '已上映',
		poster: 'https://example.com/posters/saekano_movie.jpg',
		thumbnail: 'https://example.com/thumbs/saekano_movie.jpg',
		rating: 9.2,
		genres: ['恋爱', '校园', '剧情'],
		studio: 'CloverWorks',
		director: '亀井幹太',
		releaseDate: '2019-10-26',
		watchUrl: 'https://example.com/watch/saekano-movie',
	},
];

// 获取所有作品列表
router.get('/', async (ctx: Context) => {
	const { page = 1, limit = 10, type, sort = 'releaseDate' } = ctx.query;

	let filteredData = [...worksData];

	// 按类型筛选
	if (type) {
		filteredData = filteredData.filter((work) => work.type === type);
	}

	// 排序
	if (sort === 'rating') {
		filteredData.sort((a, b) => b.rating - a.rating);
	} else if (sort === 'year') {
		filteredData.sort((a, b) => b.year.localeCompare(a.year));
	} else {
		filteredData.sort(
			(a, b) =>
				new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
		);
	}

	const startIndex = (Number(page) - 1) * Number(limit);
	const endIndex = startIndex + Number(limit);
	const paginatedData = filteredData.slice(startIndex, endIndex);

	ctx.body = {
		success: true,
		data: {
			works: paginatedData,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total: filteredData.length,
				totalPages: Math.ceil(filteredData.length / Number(limit)),
			},
			filters: {
				types: [...new Set(worksData.map((work) => work.type))],
				genres: [...new Set(worksData.flatMap((work) => work.genres))],
			},
		},
	};
});

// 获取单个作品详情
router.get('/:id', async (ctx: Context) => {
	const { id } = ctx.params;
	const work = worksData.find((w) => w.id === Number(id));

	if (!work) {
		ctx.status = 404;
		ctx.body = {
			success: false,
			message: '作品不存在',
		};
		return;
	}

	ctx.body = {
		success: true,
		data: work,
	};
});

// 获取相关作品推荐
router.get('/:id/related', async (ctx: Context) => {
	const { id } = ctx.params;
	const currentWork = worksData.find((w) => w.id === Number(id));

	if (!currentWork) {
		ctx.status = 404;
		ctx.body = {
			success: false,
			message: '作品不存在',
		};
		return;
	}

	// 简单的推荐算法：相同类型或相同制作公司的作品
	const related = worksData
		.filter((w) => w.id !== Number(id))
		.filter(
			(w) => w.type === currentWork.type || w.studio === currentWork.studio
		)
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 3);

	ctx.body = {
		success: true,
		data: {
			related,
		},
	};
});

export { router as worksRouter };
