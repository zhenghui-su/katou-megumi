import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { UploadModule } from './modules/upload/upload.module';
import { ReviewModule } from './modules/review/review.module';
import { AdminModule } from './modules/admin/admin.module';
import { VideosModule } from './modules/videos/videos.module';
import { WorksModule } from './modules/works/works.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 数据库模块
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'katou_megumi_fan_site',
      entities: [User, Image, Video, Work, SiteStats, PendingImage],
      synchronize: true, // 开发环境自动同步表结构
      logging: false,
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
  ],
})
export class AppModule {}