import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/User';
import { Image } from '../../entities/Image';
import { Video } from '../../entities/Video';
import { PendingImage } from '../../entities/PendingImage';
import { SiteStats } from '../../entities/SiteStats';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Image, Video, PendingImage, SiteStats])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}