import {
	Injectable,
	UnauthorizedException,
	ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/User';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService
	) {}

	async register(registerDto: RegisterDto) {
		const { username, email, password } = registerDto;

		// 检查用户名是否已存在
		const existingUser = await this.userRepository.findOne({
			where: [{ username }, { email }],
		});

		if (existingUser) {
			throw new ConflictException('用户名或邮箱已存在');
		}

		// 密码加密
		const hashedPassword = await bcrypt.hash(password, 10);

		// 创建用户
		const user = this.userRepository.create({
			username,
			email,
			password: hashedPassword,
			role: 'user',
			status: 'active',
		});

		const savedUser = await this.userRepository.save(user);

		// 生成JWT token
		const payload = {
			sub: savedUser.id,
			username: savedUser.username,
			role: savedUser.role,
		};
		const token = this.jwtService.sign(payload);

		return {
			user: {
				id: savedUser.id,
				username: savedUser.username,
				email: savedUser.email,
				role: savedUser.role,
			},
			token,
		};
	}

	async login(loginDto: LoginDto) {
		const { username, password } = loginDto;

		// 查找用户
		const user = await this.userRepository.findOne({
			where: { username },
		});

		if (!user) {
			throw new UnauthorizedException('用户名或密码错误');
		}

		// 验证密码
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('用户名或密码错误');
		}

		// 检查用户状态
		if (user.status !== 'active') {
			throw new UnauthorizedException('账户已被禁用');
		}

		// 生成JWT token
		const payload = { sub: user.id, username: user.username, role: user.role };
		const token = this.jwtService.sign(payload);

		return {
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
			token,
		};
	}

	async validateUser(username: string, password: string): Promise<any> {
		const user = await this.userRepository.findOne({
			where: { username },
		});

		if (user && (await bcrypt.compare(password, user.password))) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async findById(id: number): Promise<User | null> {
		return this.userRepository.findOne({ where: { id } });
	}
}
