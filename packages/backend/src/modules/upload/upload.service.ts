import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingImage } from '../../entities/PendingImage';
import { User } from '../../entities/User';
import { Music } from '../../entities/Music';
import { CosService } from '../../services/cos.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
	private readonly allowedTypes = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'video/mp4',
		'video/webm',
		'audio/mp3',
		'audio/wav',
		'audio/ogg',
	];

	constructor(
		@InjectRepository(PendingImage)
		private pendingImageRepository: Repository<PendingImage>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Music)
		private musicRepository: Repository<Music>,
		private cosService: CosService
	) {}

	// 验证文件类型
	private validateFileType(mimetype: string): boolean {
		return this.allowedTypes.includes(mimetype);
	}

	// 单文件上传（需要认证）- 提交审核
	async uploadSingleFile(
		file: Express.Multer.File,
		userId: number,
		category: string = 'fanart'
	) {
		// 验证文件类型
		if (!this.validateFileType(file.mimetype)) {
			throw new BadRequestException('不支持的文件类型');
		}

		// 只验证图片类型用于审核
		if (!file.mimetype.startsWith('image/')) {
			throw new BadRequestException('审核功能仅支持图片文件');
		}

		// 生成唯一文件名
		const fileName = this.cosService.generateFileName(
			file.originalname,
			category
		);

		// 创建临时存储目录
		const tempDir = path.join(process.cwd(), 'temp', 'pending-images');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		// 写入到临时目录
		const tempFilePath = path.join(tempDir, fileName);
		const fileDir = path.dirname(tempFilePath);
		if (!fs.existsSync(fileDir)) {
			fs.mkdirSync(fileDir, { recursive: true });
		}

		try {
			fs.writeFileSync(tempFilePath, file.buffer);
		} catch (error) {
			console.error('写入文件失败:', error);
			throw new BadRequestException('文件处理失败');
		}

		// 生成临时访问URL（本地文件服务）
		const tempFileUrl = `http://localhost:8080/temp/pending-images/${fileName}`;

		// 处理中文文件名
		const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

		// 保存到待审核表
		const pendingImage = this.pendingImageRepository.create({
			title: originalName,
			url: tempFileUrl,
			category: category as 'official' | 'anime' | 'wallpaper' | 'fanart',
			originalFilename: originalName,
			fileSize: file.size,
			mimeType: file.mimetype,
			userId: userId,
			status: 'pending',
			localPath: tempFilePath,
		});

		await this.pendingImageRepository.save(pendingImage);

		return {
			fileName: fileName,
			originalName: originalName,
			size: file.size,
			mimeType: file.mimetype,
			status: 'pending',
		};
	}

	// 多文件上传（需要认证）- 提交审核
	async uploadMultipleFiles(
		files: Express.Multer.File[],
		userId: number,
		category: string = 'fanart'
	) {
		// 验证所有文件类型
		for (const file of files) {
			if (!this.validateFileType(file.mimetype)) {
				throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`);
			}
			// 只验证图片类型用于审核
			if (!file.mimetype.startsWith('image/')) {
				throw new BadRequestException('审核功能仅支持图片文件');
			}
		}

		// 创建临时存储目录
		const tempDir = path.join(process.cwd(), 'temp', 'pending-images');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		const uploadResults = [];

		for (const file of files) {
			const fileName = this.cosService.generateFileName(
				file.originalname,
				category
			);

			// 写入到临时目录
			const tempFilePath = path.join(tempDir, fileName);
			const fileDir = path.dirname(tempFilePath);
			if (!fs.existsSync(fileDir)) {
				fs.mkdirSync(fileDir, { recursive: true });
			}

			try {
				fs.writeFileSync(tempFilePath, file.buffer);
			} catch (error) {
				console.error('写入文件失败:', error);
				throw new BadRequestException(`文件处理失败: ${file.originalname}`);
			}

			// 生成临时访问URL（本地文件服务）
			const tempFileUrl = `http://localhost:8080/temp/pending-images/${fileName}`;

			// 处理中文文件名
			const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

			// 保存到待审核表
			const pendingImage = this.pendingImageRepository.create({
				title: originalName,
				url: tempFileUrl,
				category: category as 'official' | 'anime' | 'wallpaper' | 'fanart',
				originalFilename: originalName,
				fileSize: file.size,
				mimeType: file.mimetype,
				userId: userId,
				status: 'pending',
				localPath: tempFilePath,
			});

			await this.pendingImageRepository.save(pendingImage);

			uploadResults.push({
				fileName: fileName,
				originalName: originalName,
				size: file.size,
				mimeType: file.mimetype,
				status: 'pending',
			});
		}

		return uploadResults;
	}

	// 公共单文件上传接口（无需认证）
	async uploadPublicSingleFile(file: Express.Multer.File) {
		// 验证文件类型
		if (!this.validateFileType(file.mimetype)) {
			throw new BadRequestException('不支持的文件类型');
		}

		if (!this.cosService.isCOSConfigured()) {
			throw new BadRequestException('COS服务未配置，请联系管理员');
		}

		// 生成唯一文件名
		const fileName = this.cosService.generateFileName(file.originalname);

		// 上传到COS
		const fileUrl = await this.cosService.uploadToCOS(
			file.buffer,
			fileName,
			file.mimetype
		);

		return {
			url: fileUrl,
			fileName: fileName,
			originalName: file.originalname,
			size: file.size,
			mimeType: file.mimetype,
		};
	}

	// 音乐文件上传
	async uploadMusicFile(
		file: Express.Multer.File,
		userId: number,
		metadata: {
			title: string;
			artist: string;
			category: string;
			description?: string;
			cover?: string;
		}
	) {
		// 验证文件类型
		const allowedMimeTypes = [
			'audio/mpeg',
			'audio/mp3',
			'audio/wav',
			'audio/ogg',
			'audio/m4a',
			'video/mp4',
		];
		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException('不支持的音乐文件格式');
		}

		if (!this.cosService.isCOSConfigured()) {
			throw new BadRequestException('COS服务未配置，请联系管理员');
		}

		// 生成唯一文件名
		const fileName = this.cosService.generateFileName(
			file.originalname,
			'music'
		);

		try {
			// 上传到COS
			const fileUrl = await this.cosService.uploadToCOS(
				file.buffer,
				fileName,
				file.mimetype
			);

			// 获取音频时长（简单估算，实际项目中可能需要使用专门的库）
			const duration = this.estimateAudioDuration(file.size, file.mimetype);

			// 保存到数据库
			const music = this.musicRepository.create({
				title: metadata.title,
				artist: metadata.artist,
				src: fileUrl,
				duration,
				category: metadata.category,
				description: metadata.description,
				cover: metadata.cover,
			});

			const savedMusic = await this.musicRepository.save(music);

			return {
				id: savedMusic.id,
				title: savedMusic.title,
				artist: savedMusic.artist,
				src: savedMusic.src,
				duration: savedMusic.duration,
				category: savedMusic.category,
				description: savedMusic.description,
				cover: savedMusic.cover,
				url: fileUrl,
				filename: file.originalname,
				size: file.size,
				mimetype: file.mimetype,
			};
		} catch (error: any) {
			throw new BadRequestException(`音乐文件上传失败: ${error.message}`);
		}
	}

	// 简单估算音频时长（基于文件大小和比特率）
	private estimateAudioDuration(fileSize: number, mimetype: string): number {
		// 这是一个简单的估算，实际项目中建议使用 ffprobe 或其他专业工具
		let estimatedBitrate = 128; // kbps

		if (mimetype.includes('wav')) {
			estimatedBitrate = 1411; // CD质量WAV
		} else if (mimetype.includes('m4a')) {
			estimatedBitrate = 256;
		}

		// 计算时长（秒）= 文件大小(字节) * 8 / 比特率(kbps) / 1000
		const durationInSeconds = Math.round(
			(fileSize * 8) / (estimatedBitrate * 1000)
		);
		return Math.max(durationInSeconds, 1); // 至少1秒
	}

	// 删除COS文件
	async deleteFile(fileUrl: string, userId: number) {
		if (!this.cosService.isCOSConfigured()) {
			throw new BadRequestException('COS服务未配置，请联系管理员');
		}

		try {
			// 从URL中提取文件名
			const urlParts = fileUrl.split('/');
			const fileName = urlParts.slice(-3).join('/'); // 获取 images/category/filename 部分

			// 删除COS文件
			await this.cosService.deleteFromCOS(fileName);

			return {
				url: fileUrl,
				fileName: fileName,
				message: '文件删除成功',
			};
		} catch (error: any) {
			throw new BadRequestException(`文件删除失败: ${error.message}`);
		}
	}
}
