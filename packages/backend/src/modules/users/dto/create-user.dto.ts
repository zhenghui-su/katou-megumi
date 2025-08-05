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

export class CreateUserDto {
	@ApiProperty({ description: '用户名', example: 'john_doe' })
	@IsString()
	@MinLength(3)
	username!: string;

	@ApiProperty({ description: '邮箱', example: 'john@example.com' })
	@IsEmail()
	email!: string;

	@ApiProperty({ description: '昵称', example: '约翰', required: false })
	@IsOptional()
	@IsString()
	nickname?: string;

	@ApiProperty({ description: '头像URL', required: false })
	@IsOptional()
	@IsString()
	avatar?: string;

	@ApiProperty({ description: '密码', example: 'password123' })
	@IsString()
	@MinLength(6)
	password!: string;

	@ApiProperty({ description: '角色', enum: UserRole, example: UserRole.USER })
	@IsEnum(UserRole, {
		message: 'role must be one of the following values: admin, moderator, user'
	})
	role!: UserRole;

	@ApiProperty({ description: '状态', enum: UserStatus, example: UserStatus.ACTIVE })
	@IsEnum(UserStatus, {
		message: 'status must be one of the following values: active, inactive, banned'
	})
	status!: UserStatus;
}