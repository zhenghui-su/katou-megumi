import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({ summary: '创建用户' })
	@ApiResponse({ status: 201, description: '用户创建成功' })
	@ApiResponse({ status: 400, description: '请求参数错误' })
	@ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
	async create(@Body() createUserDto: CreateUserDto) {
		const result = await this.usersService.create(createUserDto);
		return {
			success: true,
			data: result,
			message: '用户创建成功',
		};
	}

	@Get()
	@ApiOperation({ summary: '获取用户列表' })
	@ApiResponse({ status: 200, description: '获取成功' })
	async findAll(@Query() query: QueryUserDto) {
		const result = await this.usersService.findAll(query);
		return {
			success: true,
			data: result.data,
			meta: {
				total: result.total,
				page: result.page,
				limit: result.limit,
				totalPages: result.totalPages,
			},
		};
	}

	@Get('stats')
	@ApiOperation({ summary: '获取用户统计信息' })
	@ApiResponse({ status: 200, description: '获取成功' })
	async getStats() {
		const result = await this.usersService.getStats();
		return {
			success: true,
			data: result,
		};
	}

	@Get(':id')
	@ApiOperation({ summary: '根据ID获取用户' })
	@ApiParam({ name: 'id', description: '用户ID' })
	@ApiResponse({ status: 200, description: '获取成功' })
	@ApiResponse({ status: 404, description: '用户不存在' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.usersService.findOne(id);
		return {
			success: true,
			data: result,
		};
	}

	@Patch(':id')
	@ApiOperation({ summary: '更新用户信息' })
	@ApiParam({ name: 'id', description: '用户ID' })
	@ApiResponse({ status: 200, description: '更新成功' })
	@ApiResponse({ status: 404, description: '用户不存在' })
	@ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		const result = await this.usersService.update(id, updateUserDto);
		return {
			success: true,
			data: result,
			message: '用户更新成功',
		};
	}

	@Delete(':id')
	@ApiOperation({ summary: '删除用户' })
	@ApiParam({ name: 'id', description: '用户ID' })
	@ApiResponse({ status: 200, description: '删除成功' })
	@ApiResponse({ status: 404, description: '用户不存在' })
	async remove(@Param('id', ParseIntPipe) id: number) {
		const result = await this.usersService.remove(id);
		return {
			success: true,
			message: result.message,
		};
	}

	@Post(':id/reset-password')
	@ApiOperation({ summary: '重置用户密码' })
	@ApiParam({ name: 'id', description: '用户ID' })
	@ApiResponse({ status: 200, description: '密码重置成功' })
	@ApiResponse({ status: 404, description: '用户不存在' })
	async resetPassword(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: { password: string },
	) {
		const result = await this.usersService.resetPassword(id, body.password);
		return {
			success: true,
			message: result.message,
		};
	}

	@Post('batch')
	@ApiOperation({ summary: '批量操作用户' })
	@ApiResponse({ status: 200, description: '批量操作成功' })
	@ApiResponse({ status: 404, description: '部分用户不存在' })
	async batchUpdate(
		@Body() body: {
			userIds: number[];
			action: 'activate' | 'deactivate' | 'ban' | 'delete';
		},
	) {
		const result = await this.usersService.batchUpdate(body.userIds, body.action);
		return {
			success: true,
			message: result.message,
		};
	}
}