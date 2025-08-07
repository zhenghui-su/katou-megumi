import {
	Controller,
	Get,
	Post,
	Put,
	Body,
	UseGuards,
	Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QrCodeLoginDto, QrCodeConfirmDto } from './dto/qr-code.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: '用户注册' })
	@ApiResponse({ status: 201, description: '注册成功' })
	@ApiResponse({ status: 400, description: '请求参数错误' })
	@ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
	async register(@Body() registerDto: RegisterDto) {
		const result = await this.authService.register(registerDto);
		return {
			success: true,
			message: '注册成功',
			data: result,
		};
	}

	@Post('login')
	@ApiOperation({ summary: '用户登录' })
	@ApiResponse({ status: 200, description: '登录成功' })
	@ApiResponse({ status: 401, description: '用户名或密码错误' })
	async login(@Body() loginDto: LoginDto) {
		const result = await this.authService.login(loginDto);
		return {
			success: true,
			message: '登录成功',
			data: result,
		};
	}

	@Get('profile')
	@UseGuards(AuthGuard('jwt'))
	@ApiOperation({ summary: '获取用户信息' })
	@ApiResponse({ status: 200, description: '获取成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	async getProfile(@Request() req: any) {
		const user = await this.authService.findById(req.user.id);
		if (!user) {
			return {
				success: false,
				message: '用户不存在',
			};
		}
		Reflect.deleteProperty(user, 'password');
		Reflect.deleteProperty(user, 'updatedAt');
		return {
			success: true,
			data: user,
		};
	}

	@Put('profile')
	@UseGuards(AuthGuard('jwt'))
	@ApiOperation({ summary: '更新个人资料' })
	@ApiResponse({ status: 200, description: '更新成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	@ApiResponse({ status: 400, description: '请求参数错误' })
	async updateProfile(
		@Request() req: any,
		@Body() updateProfileDto: UpdateProfileDto
	) {
		const result = await this.authService.updateProfile(
			req.user.id,
			updateProfileDto
		);
		return {
			success: true,
			message: '个人资料更新成功',
			data: result,
		};
	}

	@Post('qr-code/generate')
	@ApiOperation({ summary: '生成二维码' })
	@ApiResponse({ status: 200, description: '生成成功' })
	async generateQrCode() {
		const result = await this.authService.generateQrCode();
		return {
			success: true,
			data: result,
		};
	}

	@Get('qr-code/status/:qrCodeId')
	@ApiOperation({ summary: '检查二维码状态' })
	@ApiResponse({ status: 200, description: '检查成功' })
	async checkQrCodeStatus(@Request() req: any) {
		const qrCodeId = req.params.qrCodeId;
		const result = await this.authService.checkQrCodeStatus(qrCodeId);
		return {
			success: true,
			data: result,
		};
	}

	@Post('qr-code/scan')
	@UseGuards(AuthGuard('jwt'))
	@ApiOperation({ summary: '扫描二维码' })
	@ApiResponse({ status: 200, description: '扫描成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	async scanQrCode(@Request() req: any, @Body() qrCodeConfirmDto: QrCodeConfirmDto) {
		const result = await this.authService.scanQrCode(qrCodeConfirmDto.qrCodeId, req.user.id);
		return {
			success: result.success,
			message: result.message,
			data: result
		};
	}

	@Post('qr-code/confirm')
	@UseGuards(AuthGuard('jwt'))
	@ApiOperation({ summary: '确认二维码登录' })
	@ApiResponse({ status: 200, description: '确认成功' })
	@ApiResponse({ status: 401, description: '未授权' })
	async confirmQrCodeLogin(@Request() req: any, @Body() qrCodeConfirmDto: QrCodeConfirmDto) {
		const result = await this.authService.confirmQrCodeLogin(qrCodeConfirmDto, req.user.id);
		return {
			success: result.success,
			message: result.message,
			data: result
		};
	}

	@Post('qr-code/cancel')
	@ApiOperation({ summary: '取消扫码' })
	@ApiResponse({ status: 200, description: '取消成功' })
	async cancelQrCodeScan(@Body() qrCodeConfirmDto: QrCodeConfirmDto) {
		const result = await this.authService.cancelQrCodeScan(qrCodeConfirmDto.qrCodeId);
		return {
			success: result.success,
			message: result.message,
			data: result
		};
	}
}
