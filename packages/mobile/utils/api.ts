import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 请将 YOUR_IP_ADDRESS 替换为你的实际IP地址
// 可以通过以下方式查找:
// 1. 在终端运行: ifconfig | grep "inet " | grep -v 127.0.0.1
// 2. 或者在系统偏好设置 -> 网络中查看
// 3. 确保手机和电脑在同一个WiFi网络下
// 注意：后端服务运行在8080端口
const BASE_URL = 'http://192.168.1.102:8080/api';

// 创建axios实例
const api = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
	async (config) => {
		try {
			const token = await AsyncStorage.getItem('userToken');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch (error) {
			console.error('获取token失败:', error);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response) {
			// 服务器返回错误状态码
			console.error('API错误:', error.response.status, error.response.data);
		} else if (error.request) {
			// 请求发出但没有收到响应
			console.error('网络错误:', error.request);
		} else {
			// 其他错误
			console.error('请求配置错误:', error.message);
		}
		return Promise.reject(error);
	}
);

export default api;

// 导出常用的API方法
export const apiMethods = {
	// 扫描二维码
	scanQrCode: (qrCodeId: string) => {
		return api.post('/auth/qr-code/scan', {
			qrCodeId,
		});
	},

	// 确认二维码登录
	confirmQrLogin: (qrCodeId: string) => {
		return api.post('/auth/qr-code/confirm', {
			qrCodeId,
		});
	},

	// 取消扫码
	cancelQrCodeScan: (qrCodeId: string) => {
		return api.post('/auth/qr-code/cancel', {
			qrCodeId,
		});
	},

	// 获取用户信息
	getUserInfo: () => {
		return api.get('/auth/profile');
	},

	// 用户登录
	login: (username: string, password: string) => {
		return api.post('/auth/login', {
			username,
			password,
		});
	},

	// 用户注册
	register: (username: string, email: string, password: string) => {
		return api.post('/auth/register', {
			username,
			email,
			password,
		});
	},
};
