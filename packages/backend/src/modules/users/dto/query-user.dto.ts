import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryUserDto {
	@ApiProperty({ description: '页码', example: '1', required: false })
	@IsOptional()
	@IsNumberString()
	page?: string;

	@ApiProperty({ description: '每页数量', example: '10', required: false })
	@IsOptional()
	@IsNumberString()
	limit?: string;

	@ApiProperty({ description: '搜索关键词', example: 'john', required: false })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiProperty({ description: '状态筛选', enum: ['active', 'inactive', 'banned'], required: false })
	@IsOptional()
	@IsEnum(['active', 'inactive', 'banned'])
	status?: 'active' | 'inactive' | 'banned';

	@ApiProperty({ description: '角色筛选', enum: ['admin', 'moderator', 'user'], required: false })
	@IsOptional()
	@IsEnum(['admin', 'moderator', 'user'])
	role?: 'admin' | 'moderator' | 'user';
}