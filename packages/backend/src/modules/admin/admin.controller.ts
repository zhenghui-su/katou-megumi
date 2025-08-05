import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('管理员相关数据')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AdminController {
	constructor(private adminService: AdminService) {}

	@Get('stats')
	@ApiOperation({ summary: '获取系统统计数据' })
	@ApiResponse({ status: 200, description: '获取成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	@ApiResponse({ status: 403, description: '权限不足' })
	async getStats() {
		const result = await this.adminService.getSystemStats();

		return {
			success: true,
			data: result,
		};
	}

	@Get('dashboard')
	@ApiOperation({ summary: '获取仪表盘数据' })
	@ApiResponse({ status: 200, description: '获取成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	@ApiResponse({ status: 403, description: '权限不足' })
	async getDashboardData() {
		const result = await this.adminService.getDashboardData();

		return {
			success: true,
			data: result,
		};
	}
}
