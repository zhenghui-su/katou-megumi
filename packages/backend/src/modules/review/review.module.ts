import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingImage } from '../../entities/PendingImage';
import { Image } from '../../entities/Image';
import { User } from '../../entities/User';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { CosService } from '../../services/cos.service';

@Module({
	imports: [TypeOrmModule.forFeature([PendingImage, Image, User])],
	controllers: [ReviewController],
	providers: [ReviewService, CosService],
	exports: [ReviewService],
})
export class ReviewModule {}
