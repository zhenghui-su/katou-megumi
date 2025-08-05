import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { Music } from '../../entities/Music';
import { CosService } from '../../services/cos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Music])],
  controllers: [MusicController],
  providers: [MusicService, CosService],
  exports: [MusicService],
})
export class MusicModule {}