import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Image } from '../entities/Image';
import { Video } from '../entities/Video';
import { Work } from '../entities/Work';
import { SiteStats } from '../entities/SiteStats';

// 数据库配置
export const AppDataSource = new DataSource({
	type: 'mysql',
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '3306'),
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'katou_megumi_fan_site',
	synchronize: true, // 开发环境自动同步表结构
	logging: false,
	entities: [User, Image, Video, Work, SiteStats],
	migrations: [],
	subscribers: [],
});

// 检查数据库连接状态
export let isDatabaseConnected = false;

// 初始化数据库连接
export const initDatabase = async () => {
	try {
		// 初始化数据源
		await AppDataSource.initialize();
		isDatabaseConnected = true;
		console.log('✅ 数据库连接成功，TypeORM初始化完成');
		
		// 可选：插入一些初始数据
		await seedInitialData();
	} catch (error) {
		console.warn('⚠️  数据库连接失败，将以模拟数据模式运行:', error instanceof Error ? error.message : String(error));
		isDatabaseConnected = false;
		// 不抛出错误，允许服务器继续启动
	}
};

// 插入初始数据
const seedInitialData = async () => {
	try {
		const userRepository = AppDataSource.getRepository(User);
		
		// 检查是否已有管理员用户
		const adminExists = await userRepository.findOne({ where: { username: 'admin' } });
		
		if (!adminExists) {
			// 创建默认管理员账户
			const bcrypt = await import('bcryptjs');
			const hashedPassword = await bcrypt.hash('admin123', 10);
			
			const admin = userRepository.create({
				username: 'admin',
				email: 'admin@katou-megumi.com',
				password: hashedPassword,
				role: 'admin',
				status: 'active'
			});
			
			await userRepository.save(admin);
			console.log('✅ 默认管理员账户创建成功 (admin/admin123)');
		}
	} catch (error) {
		console.warn('⚠️  初始数据插入失败:', error instanceof Error ? error.message : String(error));
	}
};

export default AppDataSource;
