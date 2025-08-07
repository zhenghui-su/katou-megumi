import { Controller, Post, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { CleanupService } from './cleanup.service';
import { AdminGuard } from '../../guards/admin.guard';

@ApiTags('清理管理')
@Controller('cleanup')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class CleanupController {
	constructor(private cleanupService: CleanupService) {}

	@Post('manual')
	@ApiOperation({ summary: '手动触发清理任务' })
	@ApiResponse({ status: 200, description: '清理任务执行成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	@ApiResponse({ status: 403, description: '权限不足' })
	async manualCleanup() {
		const result = await this.cleanupService.manualCleanup();

		return {
			success: result.success,
			message: result.message,
			error: result.error,
		};
	}

	@Get('stats')
	@ApiOperation({ summary: '获取清理统计信息' })
	@ApiResponse({ status: 200, description: '获取成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	@ApiResponse({ status: 403, description: '权限不足' })
	async getCleanupStats() {
		const result = await this.cleanupService.getCleanupStats();

		return {
			success: true,
			data: result,
		};
	}

	@Get('config')
	@ApiOperation({ summary: '获取清理配置' })
	@ApiResponse({ status: 200, description: '获取成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	@ApiResponse({ status: 403, description: '权限不足' })
	async getConfig() {
		const config = this.cleanupService.getConfig();
		return {
			success: true,
			data: config,
		};
	}

	@Put('config')
	@ApiOperation({ summary: '更新清理配置' })
	@ApiResponse({ status: 200, description: '更新成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	@ApiResponse({ status: 403, description: '权限不足' })
	async updateConfig(
		@Body() configData: { retentionDays?: number; maxRetainedImages?: number }
	) {
		try {
			const updatedConfig = this.cleanupService.updateConfig(configData);
			return {
				success: true,
				message: '配置更新成功',
				data: updatedConfig,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : '配置更新失败',
			};
		}
	}
}
