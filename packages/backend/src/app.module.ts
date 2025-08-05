import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Entities
import { User } from './entities/User';
import { Image } from './entities/Image';
import { Video } from './entities/Video';
import { Work } from './entities/Work';
import { SiteStats } from './entities/SiteStats';
import { PendingImage } from './entities/PendingImage';
import { Notification } from './entities/Notification';
import { Music } from './entities/Music';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { UploadModule } from './modules/upload/upload.module';
import { ReviewModule } from './modules/review/review.module';
import { AdminModule } from './modules/admin/admin.module';
import { VideosModule } from './modules/videos/videos.module';
import { WorksModule } from './modules/works/works.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UsersModule } from './modules/users/users.module';
import { MusicModule } from './modules/music/music.module';
import * as path from 'path';

@Module({
	imports: [
		// 配置模块
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: path.resolve(__dirname, '.env'),
		}),

		// 数据库模块
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'mysql',
				host: configService.get('DB_HOST', 'localhost'),
				port: configService.get('DB_PORT', 3306),
				username: configService.get('DB_USER', 'root'),
				password: configService.get('DB_PASSWORD', ''),
				database: configService.get('DB_NAME', 'katou_megumi_fan_site'),
				entities: [
					User,
					Image,
					Video,
					Work,
					SiteStats,
					PendingImage,
					Notification,
					Music,
				],
				synchronize: true, // 开发环境自动同步表结构
				logging: false, // 启用SQL日志以调试删除问题
			}),
		}),

		// 静态文件服务
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
			serveRoot: '/public',
		}),

		// 临时文件服务
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), 'temp'),
			serveRoot: '/temp',
		}),

		// 业务模块
		AuthModule,
		GalleryModule,
		UploadModule,
		ReviewModule,
		AdminModule,
		VideosModule,
		WorksModule,
		NotificationModule,
		UsersModule,
		MusicModule,
	],
})
export class AppModule {}
