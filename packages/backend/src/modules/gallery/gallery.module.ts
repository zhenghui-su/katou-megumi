import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../../entities/Image';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
	imports: [TypeOrmModule.forFeature([Image])],
	controllers: [GalleryController],
	providers: [GalleryService],
	exports: [GalleryService],
})
export class GalleryModule {}
