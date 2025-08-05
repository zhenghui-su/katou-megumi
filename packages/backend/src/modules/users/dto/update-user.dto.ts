import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum UserRole {
	ADMIN = 'admin',
	MODERATOR = 'moderator',
	USER = 'user',
}

enum UserStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	BANNED = 'banned',
}

export class UpdateUserDto {
	@ApiProperty({ description: '用户名', example: 'john_doe', required: false })
	@IsOptional()
	@IsString()
	@MinLength(3)
	username?: string;

	@ApiProperty({ description: '邮箱', example: 'john@example.com', required: false })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiProperty({ description: '昵称', example: '约翰', required: false })
	@IsOptional()
	@IsString()
	nickname?: string;

	@ApiProperty({ description: '头像URL', required: false })
	@IsOptional()
	@IsString()
	avatar?: string;

	@ApiProperty({ description: '角色', enum: UserRole, required: false })
	@IsOptional()
	@IsEnum(UserRole, {
		message: 'role must be one of the following values: admin, moderator, user'
	})
	role?: UserRole;

	@ApiProperty({ description: '状态', enum: UserStatus, required: false })
	@IsOptional()
	@IsEnum(UserStatus, {
		message: 'status must be one of the following values: active, inactive, banned'
	})
	status?: UserStatus;
}