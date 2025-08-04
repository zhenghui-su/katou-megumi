import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingImage } from '../../entities/PendingImage';
import { User } from '../../entities/User';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CosService } from '../../services/cos.service';

@Module({
	imports: [TypeOrmModule.forFeature([PendingImage, User])],
	controllers: [UploadController],
	providers: [UploadService, CosService],
	exports: [UploadService],
})
export class UploadModule {}
