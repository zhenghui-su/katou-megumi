import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/User';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	// 获取用户列表
	async findAll(query: QueryUserDto) {
		const { page = '1', limit = '10', search, status, role } = query;
		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);
		const skip = (pageNum - 1) * limitNum;

		const queryBuilder = this.usersRepository.createQueryBuilder('user');

		// 搜索条件
		if (search) {
			queryBuilder.where(
				'user.username LIKE :search OR user.email LIKE :search OR user.nickname LIKE :search',
				{ search: `%${search}%` }
			);
		}

		// 状态筛选
		if (status) {
			queryBuilder.andWhere('user.status = :status', { status });
		}

		// 角色筛选
		if (role) {
			queryBuilder.andWhere('user.role = :role', { role });
		}

		// 排序和分页
		queryBuilder
			.orderBy('user.createdAt', 'DESC')
			.skip(skip)
			.take(limitNum);

		const [users, total] = await queryBuilder.getManyAndCount();

		// 移除密码字段
		const safeUsers = users.map(user => {
			const { password, ...safeUser } = user;
			return safeUser;
		});

		return {
			data: safeUsers,
			total,
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(total / limitNum),
		};
	}

	// 根据ID获取用户
	async findOne(id: number) {
		const user = await this.usersRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('用户不存在');
		}

		const { password, ...safeUser } = user;
		return safeUser;
	}

	// 创建用户
	async create(createUserDto: CreateUserDto) {
		// 检查用户名是否已存在
		const existingUsername = await this.usersRepository.findOne({
			where: { username: createUserDto.username },
		});
		if (existingUsername) {
			throw new ConflictException('用户名已存在');
		}

		// 检查邮箱是否已存在
		const existingEmail = await this.usersRepository.findOne({
			where: { email: createUserDto.email },
		});
		if (existingEmail) {
			throw new ConflictException('邮箱已存在');
		}

		// 加密密码
		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

		// 创建用户
		const user = this.usersRepository.create({
			...createUserDto,
			password: hashedPassword,
		});

		const savedUser = await this.usersRepository.save(user);
		const { password, ...safeUser } = savedUser;
		return safeUser;
	}

	// 更新用户
	async update(id: number, updateUserDto: UpdateUserDto) {
		const user = await this.usersRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('用户不存在');
		}

		// 检查用户名是否已被其他用户使用
		if (updateUserDto.username) {
			const existingUsername = await this.usersRepository.findOne({
				where: { username: updateUserDto.username },
			});
			if (existingUsername && existingUsername.id !== id) {
				throw new ConflictException('用户名已存在');
			}
		}

		// 检查邮箱是否已被其他用户使用
		if (updateUserDto.email) {
			const existingEmail = await this.usersRepository.findOne({
				where: { email: updateUserDto.email },
			});
			if (existingEmail && existingEmail.id !== id) {
				throw new ConflictException('邮箱已存在');
			}
		}

		// 更新用户
		await this.usersRepository.update(id, updateUserDto);
		const updatedUser = await this.usersRepository.findOne({ where: { id } });
		const { password, ...safeUser } = updatedUser!;
		return safeUser;
	}

	// 删除用户
	async remove(id: number) {
		const user = await this.usersRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('用户不存在');
		}

		await this.usersRepository.remove(user);
		return { message: '用户删除成功' };
	}

	// 重置密码
	async resetPassword(id: number, newPassword: string) {
		const user = await this.usersRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('用户不存在');
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await this.usersRepository.update(id, { password: hashedPassword });
		return { message: '密码重置成功' };
	}

	// 批量操作用户
	async batchUpdate(userIds: number[], action: 'activate' | 'deactivate' | 'ban' | 'delete') {
		const users = await this.usersRepository.findByIds(userIds);
		if (users.length !== userIds.length) {
			throw new NotFoundException('部分用户不存在');
		}

		switch (action) {
			case 'activate':
				await this.usersRepository.update(userIds, { status: 'active' });
				break;
			case 'deactivate':
				await this.usersRepository.update(userIds, { status: 'inactive' });
				break;
			case 'ban':
				await this.usersRepository.update(userIds, { status: 'banned' });
				break;
			case 'delete':
				await this.usersRepository.delete(userIds);
				break;
		}

		return { message: `批量${action}操作成功` };
	}

	// 获取用户统计信息
	async getStats() {
		const total = await this.usersRepository.count();
		const active = await this.usersRepository.count({ where: { status: 'active' } });
		const inactive = await this.usersRepository.count({ where: { status: 'inactive' } });
		const banned = await this.usersRepository.count({ where: { status: 'banned' } });
		const admin = await this.usersRepository.count({ where: { role: 'admin' } });
		const moderator = await this.usersRepository.count({ where: { role: 'moderator' } });
		const user = await this.usersRepository.count({ where: { role: 'user' } });

		return {
			total,
			status: { active, inactive, banned },
			role: { admin, moderator, user },
		};
	}
}