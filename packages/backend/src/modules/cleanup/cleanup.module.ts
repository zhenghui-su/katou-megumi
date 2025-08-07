import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PendingImage } from '../../entities/PendingImage';
import { CleanupController } from './cleanup.controller';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingImage]),
    ScheduleModule.forRoot(), // 启用定时任务
  ],
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}