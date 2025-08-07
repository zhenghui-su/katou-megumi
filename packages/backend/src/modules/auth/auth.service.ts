import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/User';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QrCodeLoginDto, QrCodeConfirmDto } from './dto/qr-code.dto';

@Injectable()
export class AuthService {
	// 存储二维码状态的内存缓存
	private qrCodeCache = new Map<string, { status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'cancelled'; userId?: number; createdAt: number }>();

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService
	) {
		// 定期清理过期的二维码
		setInterval(() => {
			this.cleanExpiredQrCodes();
		}, 60000); // 每分钟清理一次
	}

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
				nickname: savedUser.nickname,
				avatar: savedUser.avatar,
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
				nickname: user.nickname,
				avatar: user.avatar,
				role: user.role,
			},
			token,
		};
	}

	async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new UnauthorizedException('用户不存在');
		}

		// 如果更新邮箱，检查是否已存在
		if (updateProfileDto.email && updateProfileDto.email !== user.email) {
			const existingUser = await this.userRepository.findOne({
				where: { email: updateProfileDto.email },
			});
			if (existingUser) {
				throw new ConflictException('邮箱已存在');
			}
		}

		// 如果更新密码，进行加密
		if (updateProfileDto.password) {
			updateProfileDto.password = await bcrypt.hash(updateProfileDto.password, 10);
		}

		// 更新用户信息
		await this.userRepository.update(userId, updateProfileDto);

		// 返回更新后的用户信息（不包含密码）
		const updatedUser = await this.userRepository.findOne({ where: { id: userId } });
		return {
			id: updatedUser!.id,
			username: updatedUser!.username,
			email: updatedUser!.email,
			nickname: updatedUser!.nickname,
			avatar: updatedUser!.avatar,
			role: updatedUser!.role,
			status: updatedUser!.status,
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

	// 生成二维码
	async generateQrCode(): Promise<{ qrCodeId: string; expiresAt: number }> {
		const qrCodeId = uuidv4();
		const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟过期

		this.qrCodeCache.set(qrCodeId, {
			status: 'pending',
			createdAt: Date.now()
		});

		return { qrCodeId, expiresAt };
	}

	// 检查二维码状态
	async checkQrCodeStatus(qrCodeId: string): Promise<{ status: string; token?: string; user_data?: any }> {
		const qrCode = this.qrCodeCache.get(qrCodeId);

		if (!qrCode) {
			return { status: 'expired' };
		}

		// 检查是否过期（5分钟）
		if (Date.now() - qrCode.createdAt > 5 * 60 * 1000) {
			this.qrCodeCache.delete(qrCodeId);
			return { status: 'expired' };
		}

		if (qrCode.status === 'confirmed' && qrCode.userId) {
			// 获取用户信息
			const user = await this.userRepository.findOne({ where: { id: qrCode.userId } });
			if (user) {
				// 生成token
				const payload = { sub: user.id, username: user.username, role: user.role };
				const token = this.jwtService.sign(payload);
				
				// 准备用户数据
				const user_data = {
					id: user.id,
					username: user.username,
					email: user.email,
					nickname: user.nickname,
					avatar: user.avatar,
					role: user.role
				};
				
				// 清理已使用的二维码
				this.qrCodeCache.delete(qrCodeId);
				
				return { status: 'confirmed', token, user_data };
			}
		}

		return { status: qrCode.status };
	}

	// 扫描二维码（设置为已扫描状态）
	async scanQrCode(qrCodeId: string, userId: number): Promise<{ success: boolean; message: string }> {
		// 检查二维码是否存在且未过期
		const qrCode = this.qrCodeCache.get(qrCodeId);
		if (!qrCode) {
			return { success: false, message: '二维码已过期' };
		}

		if (Date.now() - qrCode.createdAt > 5 * 60 * 1000) {
			this.qrCodeCache.delete(qrCodeId);
			return { success: false, message: '二维码已过期' };
		}

		if (qrCode.status !== 'pending') {
			return { success: false, message: '二维码已被使用' };
		}

		// 更新二维码状态为已扫描
		this.qrCodeCache.set(qrCodeId, {
			...qrCode,
			status: 'scanned',
			userId
		});

		return { success: true, message: '扫描成功' };
	}

	// 确认二维码登录
	async confirmQrCodeLogin(qrCodeConfirmDto: QrCodeConfirmDto, userId: number): Promise<{ success: boolean; message: string; user_data?: any; token?: string }> {
		const { qrCodeId } = qrCodeConfirmDto;

		// 检查二维码是否存在且未过期
		const qrCode = this.qrCodeCache.get(qrCodeId);
		if (!qrCode) {
			return { success: false, message: '二维码已过期' };
		}

		if (Date.now() - qrCode.createdAt > 5 * 60 * 1000) {
			this.qrCodeCache.delete(qrCodeId);
			return { success: false, message: '二维码已过期' };
		}

		if (qrCode.status !== 'scanned' && qrCode.status !== 'pending') {
			return { success: false, message: '二维码状态异常' };
		}

		// 获取用户信息
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			return { success: false, message: '用户不存在' };
		}

		// 生成token
		const payload = { sub: user.id, username: user.username, role: user.role };
		const token = this.jwtService.sign(payload);

		// 更新二维码状态为已确认
		this.qrCodeCache.set(qrCodeId, {
			...qrCode,
			status: 'confirmed',
			userId
		});

		// 返回用户信息和token
		const user_data = {
			id: user.id,
			username: user.username,
			email: user.email,
			nickname: user.nickname,
			avatar: user.avatar,
			role: user.role
		};

		return { success: true, message: '确认成功', user_data, token };
	}

	// 取消扫码（将状态设置为cancelled）
	async cancelQrCodeScan(qrCodeId: string): Promise<{ success: boolean; message: string }> {
		// 检查二维码是否存在且未过期
		const qrCode = this.qrCodeCache.get(qrCodeId);
		if (!qrCode) {
			return { success: false, message: '二维码已过期' };
		}

		if (Date.now() - qrCode.createdAt > 5 * 60 * 1000) {
			this.qrCodeCache.delete(qrCodeId);
			return { success: false, message: '二维码已过期' };
		}

		if (qrCode.status !== 'scanned') {
			return { success: false, message: '二维码状态异常' };
		}

		// 设置二维码状态为cancelled
		this.qrCodeCache.set(qrCodeId, {
			...qrCode,
			status: 'cancelled',
			userId: undefined
		});

		return { success: true, message: '取消成功' };
	}

	// 清理过期的二维码
	private cleanExpiredQrCodes(): void {
		const now = Date.now();
		for (const [qrCodeId, qrCode] of this.qrCodeCache.entries()) {
			if (now - qrCode.createdAt > 5 * 60 * 1000) {
				this.qrCodeCache.delete(qrCodeId);
			}
		}
	}
}
