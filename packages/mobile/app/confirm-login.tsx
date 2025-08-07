import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	SafeAreaView,
	ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiMethods } from '../utils/api';

interface QRData {
	website: string;
	token: string;
}

interface UserInfo {
	id: string;
	username: string;
	email: string;
	nickname?: string;
	avatar?: string;
}

export default function ConfirmLoginScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [qrData, setQrData] = useState<QRData | null>(null);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				// 解析二维码数据
				if (params.qrData) {
					const data = JSON.parse(params.qrData as string);
					setQrData(data);
				} else {
					setError('未找到二维码数据');
					return;
				}

				// 从AsyncStorage获取当前登录用户信息
				const userInfoStr = await AsyncStorage.getItem('userInfo');
				if (userInfoStr) {
					const user = JSON.parse(userInfoStr);
					setUserInfo(user);
				} else {
					setError('用户未登录，请先登录');
				}
			} catch (err) {
				console.error('加载数据失败:', err);
				setError('数据加载失败');
			}
		};

		loadData();
	}, [params.qrData]);

	const handleConfirmLogin = async () => {
		if (!qrData) return;

		setLoading(true);
		try {
			// 检查用户是否已登录
			const userToken = await AsyncStorage.getItem('userToken');
			if (!userToken) {
				setError('用户未登录，请先登录');
				return;
			}

			// qrData.token 实际上是 qrCodeId
			const response = await apiMethods.confirmQrLogin(qrData.token);

			if (
				response.status === 200 ||
				(response.status === 201 && response.data.success)
			) {
				router.push('/(tabs)/profile');
			} else {
				setError(response.data?.message || '登录失败');
			}
		} catch (err: any) {
			if (err.response?.status === 401) {
				setError('登录已过期，请重新扫描二维码');
			} else {
				setError(err.response?.data?.message || '网络错误，请稍后重试');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = async () => {
		if (qrData?.token) {
			try {
				// 调用取消扫码接口，重置二维码状态
				await apiMethods.cancelQrCodeScan(qrData.token);
			} catch (error) {
				console.error('取消扫码失败:', error);
				// 即使取消接口失败，也允许用户返回
			}
		}
		router.back();
	};
	if (error) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleCancel} style={styles.backButton}>
						<Ionicons name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>扫码登录</Text>
				</View>

				<View style={styles.content}>
					<View style={styles.errorContainer}>
						<Ionicons name='warning-outline' size={60} color='#ff6b6b' />
						<Text style={styles.errorTitle}>登录失败</Text>
						<Text style={styles.errorMessage}>{error}</Text>
						<TouchableOpacity style={styles.retryButton} onPress={handleCancel}>
							<Text style={styles.retryButtonText}>重新扫描</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	if (!qrData || !userInfo) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Ionicons name='arrow-back' size={24} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>扫码登录</Text>
				</View>

				<View style={styles.content}>
					<ActivityIndicator size='large' color='#ff6b9d' />
					<Text style={styles.loadingText}>加载中...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => {
						handleCancel();
					}}
					style={styles.backButton}
				>
					<Ionicons name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>网站扫码登录</Text>
			</View>

			<View style={styles.content}>
				{/* 网站Logo */}
				<View style={styles.logoContainer}>
					<View style={styles.logoWrapper}>
						<Image
							source={{
								uri: 'https://chen-1320883525.cos.ap-chengdu.myqcloud.com/images/official/1753844239669_unol2e.jpg',
							}}
							style={styles.logo}
							defaultSource={require('../assets/images/icon.jpg')}
						/>
					</View>
					<Text style={styles.websiteName}>加藤惠-KatouMegumi</Text>
				</View>

				{/* 用户信息 */}
				<View style={styles.userContainer}>
					<View style={styles.userInfo}>
						<Image
							source={{
								uri:
									userInfo?.avatar ||
									'https://chen-1320883525.cos.ap-chengdu.myqcloud.com/images/official/1753844239669_unol2e.jpg',
							}}
							style={styles.avatar}
						/>
						<View style={styles.userDetails}>
							<Text style={styles.username}>
								{userInfo?.nickname || '用户'}
							</Text>
							<Text style={styles.userEmail}>
								{userInfo?.email || '暂无邮箱'}
							</Text>
						</View>
					</View>
				</View>

				{/* 按钮区域 */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={[styles.confirmButton, loading && styles.disabledButton]}
						onPress={handleConfirmLogin}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator size='small' color='#fff' />
						) : (
							<Text style={styles.confirmButtonText}>确认登录</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.cancelButton}
						onPress={handleCancel}
						disabled={loading}
					>
						<Text style={styles.cancelButtonText}>取消</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 25,
		backgroundColor: '#000',
	},
	backButton: {
		padding: 8,
		marginRight: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
		flex: 1,
		textAlign: 'center',
		marginRight: 40,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 60,
	},
	logoWrapper: {
		width: 80,
		height: 80,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
		elevation: 8,
	},
	logo: {
		width: 50,
		height: 50,
		borderRadius: 10,
	},
	websiteName: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
	userContainer: {
		width: '100%',
		padding: 20,
		display: 'flex',
		marginBottom: 40,
		alignItems: 'center',
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'green',
		flex: 1,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 16,
	},
	userDetails: {
		display: 'flex',
		height: 50,
		flex: 1,
	},
	username: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	userEmail: {
		color: '#fff',
		fontSize: 14,
	},
	buttonContainer: {
		width: '100%',
		paddingHorizontal: 0,
	},
	confirmButton: {
		backgroundColor: '#ff6b9d',
		borderRadius: 25,
		paddingVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 50,
		shadowColor: '#ff6b9d',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	disabledButton: {
		opacity: 0.6,
	},
	confirmButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	cancelButton: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: '#666',
		borderRadius: 25,
		paddingVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 50,
		marginTop: 12,
	},
	cancelButtonText: {
		color: '#999',
		fontSize: 16,
		fontWeight: '500',
	},
	errorContainer: {
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	errorTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: '600',
		marginTop: 20,
		marginBottom: 12,
	},
	errorMessage: {
		color: '#999',
		fontSize: 16,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 30,
	},
	retryButton: {
		backgroundColor: '#ff6b9d',
		borderRadius: 25,
		paddingHorizontal: 32,
		paddingVertical: 12,
	},
	retryButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	loadingText: {
		color: '#999',
		fontSize: 16,
		marginTop: 16,
	},
});
