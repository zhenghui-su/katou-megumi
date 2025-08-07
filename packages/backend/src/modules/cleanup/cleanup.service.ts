import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PendingImage } from '../../entities/PendingImage';
import * as fs from 'fs';

export interface CleanupConfig {
	retentionDays: number;
	maxRetainedImages: number;
}
@Injectable()
export class CleanupService {
	private readonly logger = new Logger(CleanupService.name);

	// 默认配置
	private config: CleanupConfig = {
		retentionDays: 7,
		maxRetainedImages: 100,
	};

	constructor(
		@InjectRepository(PendingImage)
		private pendingImageRepository: Repository<PendingImage>
	) {}

	// 每天凌晨2点执行清理任务
	@Cron('0 2 * * *')
	async handleDailyCleanup() {
		this.logger.log('开始执行每日清理任务');

		try {
			await this.cleanupOldRejectedImages();
			await this.cleanupExcessRejectedImages();
			this.logger.log('每日清理任务完成');
		} catch (error) {
			this.logger.error('每日清理任务失败:', error);
		}
	}

	// 清理超过7天的已拒绝图片
	async cleanupOldRejectedImages() {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

		this.logger.log(
			`清理 ${
				this.config.retentionDays
			} 天前的已拒绝图片，截止日期: ${cutoffDate.toISOString()}`
		);

		// 查找超过保留期的已拒绝图片
		const oldRejectedImages = await this.pendingImageRepository.find({
			where: {
				status: 'rejected',
				createdAt: LessThan(cutoffDate),
			},
		});

		if (oldRejectedImages.length === 0) {
			this.logger.log('没有找到需要清理的过期已拒绝图片');
			return;
		}

		this.logger.log(`找到 ${oldRejectedImages.length} 张过期的已拒绝图片`);

		// 删除本地文件和数据库记录
		let deletedCount = 0;
		for (const image of oldRejectedImages) {
			try {
				// 删除本地文件
				if (image.localPath && fs.existsSync(image.localPath)) {
					fs.unlinkSync(image.localPath);
					this.logger.debug(`删除本地文件: ${image.localPath}`);
				}

				// 删除数据库记录
				await this.pendingImageRepository.remove(image);
				deletedCount++;
			} catch (error) {
				this.logger.error(`删除图片失败 (ID: ${image.id}):`, error);
			}
		}

		this.logger.log(`成功清理 ${deletedCount} 张过期的已拒绝图片`);
	}

	// 清理超过100张的已拒绝图片（保留最新的100张）
	async cleanupExcessRejectedImages() {
		this.logger.log(
			`检查已拒绝图片数量，最大保留: ${this.config.maxRetainedImages} 张`
		);

		// 统计已拒绝图片总数
		const totalRejectedCount = await this.pendingImageRepository.count({
			where: { status: 'rejected' },
		});

		if (totalRejectedCount <= this.config.maxRetainedImages) {
			this.logger.log(`当前已拒绝图片数量: ${totalRejectedCount}，无需清理`);
			return;
		}

		const excessCount = totalRejectedCount - this.config.maxRetainedImages;
		this.logger.log(
			`当前已拒绝图片数量: ${totalRejectedCount}，需要清理 ${excessCount} 张`
		);

		// 获取最旧的超出数量的已拒绝图片
		const excessImages = await this.pendingImageRepository.find({
			where: { status: 'rejected' },
			order: { createdAt: 'ASC' }, // 按创建时间升序，获取最旧的
			take: excessCount,
		});

		if (excessImages.length === 0) {
			this.logger.log('没有找到需要清理的超量已拒绝图片');
			return;
		}

		// 删除本地文件和数据库记录
		let deletedCount = 0;
		for (const image of excessImages) {
			try {
				// 删除本地文件
				if (image.localPath && fs.existsSync(image.localPath)) {
					fs.unlinkSync(image.localPath);
					this.logger.debug(`删除本地文件: ${image.localPath}`);
				}

				// 删除数据库记录
				await this.pendingImageRepository.remove(image);
				deletedCount++;
			} catch (error) {
				this.logger.error(`删除图片失败 (ID: ${image.id}):`, error);
			}
		}

		this.logger.log(`成功清理 ${deletedCount} 张超量的已拒绝图片`);
	}

	// 手动触发清理（用于测试或紧急清理）
	async manualCleanup() {
		this.logger.log('手动触发清理任务');

		try {
			await this.cleanupOldRejectedImages();
			await this.cleanupExcessRejectedImages();

			return {
				success: true,
				message: '手动清理任务完成',
			};
		} catch (error) {
			this.logger.error('手动清理任务失败:', error);
			return {
				success: false,
				message: '清理任务失败',
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	// 获取清理统计信息
	async getCleanupStats() {
		const totalRejected = await this.pendingImageRepository.count({
			where: { status: 'rejected' },
		});

		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

		const oldRejected = await this.pendingImageRepository.count({
			where: {
				status: 'rejected',
				createdAt: LessThan(cutoffDate),
			},
		});

		const excessCount = Math.max(
			0,
			totalRejected - this.config.maxRetainedImages
		);

		return {
			totalRejectedImages: totalRejected,
			oldRejectedImages: oldRejected,
			excessRejectedImages: excessCount,
			maxRetainedImages: this.config.maxRetainedImages,
			retentionDays: this.config.retentionDays,
			nextCleanupNeeded: oldRejected > 0 || excessCount > 0,
		};
	}

	// 获取清理配置
	getConfig(): CleanupConfig {
		return { ...this.config };
	}

	// 更新清理配置
	updateConfig(newConfig: Partial<CleanupConfig>): CleanupConfig {
		if (newConfig.retentionDays !== undefined) {
			if (newConfig.retentionDays < 1 || newConfig.retentionDays > 365) {
				throw new Error('保留天数必须在1-365之间');
			}
			this.config.retentionDays = newConfig.retentionDays;
		}

		if (newConfig.maxRetainedImages !== undefined) {
			if (
				newConfig.maxRetainedImages < 10 ||
				newConfig.maxRetainedImages > 10000
			) {
				throw new Error('最大保留数量必须在10-10000之间');
			}
			this.config.maxRetainedImages = newConfig.maxRetainedImages;
		}

		this.logger.log(`清理配置已更新: ${JSON.stringify(this.config)}`);
		return { ...this.config };
	}
}
