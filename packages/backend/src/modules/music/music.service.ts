import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Music } from '../../entities/Music';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { CosService } from '../../services/cos.service';

@Injectable()
export class MusicService {
	constructor(
		@InjectRepository(Music)
		private musicRepository: Repository<Music>,
		private cosService: CosService
	) {}

	async create(createMusicDto: CreateMusicDto): Promise<Music> {
		const music = this.musicRepository.create(createMusicDto);
		return await this.musicRepository.save(music);
	}

	async findAll(): Promise<Music[]> {
		return await this.musicRepository.find({
			order: { createdAt: 'DESC' },
		});
	}

	async findOne(id: number): Promise<Music> {
		const music = await this.musicRepository.findOne({
			where: { id },
		});
		if (!music) {
			throw new NotFoundException(`Music with ID ${id} not found`);
		}
		return music;
	}

	async update(id: number, updateMusicDto: UpdateMusicDto): Promise<Music> {
		const music = await this.findOne(id);
		Object.assign(music, updateMusicDto);
		return await this.musicRepository.save(music);
	}

	async remove(id: number): Promise<void> {
		// 使用事务确保数据一致性
		return await this.musicRepository.manager.transaction(async (manager) => {
			// 首先查找音乐记录
			const music = await manager.findOne(Music, { where: { id } });
			if (!music) {
				console.error(`音乐记录不存在，ID: ${id}`);
				throw new NotFoundException(`Music with ID ${id} not found`);
			}

			// 删除COS中的音乐文件
			if (music.src) {
				const musicKey = music.src.split('/').pop();
				if (musicKey) {
					const musicPath = `images/music/${musicKey}`;
					try {
						await this.cosService.deleteFromCOS(musicPath);
					} catch (error) {
						console.error('COS删除音乐文件失败:', error);
						// 即使删除COS文件失败，也继续删除数据库记录
					}
				}
			}

			// 删除COS中的封面文件
			if (music.cover) {
				const coverKey = music.cover.split('/').pop();
				if (coverKey) {
					const coverPath = `images/uploads/${coverKey}`;
					try {
						await this.cosService.deleteFromCOS(coverPath);
					} catch (error) {
						console.error('COS删除封面文件失败:', error);
						// 即使删除COS文件失败，也继续删除数据库记录
					}
				}
			}

			// 从数据库中完全删除记录
			try {
				const deleteResult = await manager.delete(Music, { id });

				if (deleteResult.affected === 0) {
					console.error(`数据库删除失败，没有记录被删除，ID: ${id}`);
					throw new NotFoundException(`Failed to delete music with ID ${id}`);
				}
			} catch (error) {
				console.error(`数据库删除操作失败:`, error);
				throw error;
			}
		});
	}

	async findByCategory(category: string): Promise<Music[]> {
		return await this.musicRepository.find({
			where: { category },
			order: { createdAt: 'DESC' },
		});
	}
}
