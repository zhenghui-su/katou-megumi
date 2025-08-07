import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	Modal,
	Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { apiMethods } from '@/utils/api';
import CustomAlert from '@/components/CustomAlert';

const { width } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

interface UserInfo {
	id: string;
	username: string;
	email: string;
}

interface ConfirmData {
	qrCodeId: string;
	webDomain: string;
	isError?: boolean;
	errorType?: 'notLoggedIn' | 'invalidQR' | 'formatError';
	errorMessage?: string;
}

export default function ScannerScreen() {
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? 'light'];
	const router = useRouter();
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);
	const [flashOn, setFlashOn] = useState(false);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);
	const [currentQrCodeId, setCurrentQrCodeId] = useState<string | null>(null);
	const fadeAnim = useState(new Animated.Value(0))[0];

	useEffect(() => {
		if (!permission?.granted) {
			requestPermission();
		}
		loadUserInfo();
	}, [permission]);

	const loadUserInfo = async () => {
		try {
			const userData = await AsyncStorage.getItem('userInfo');
			if (userData) {
				setUserInfo(JSON.parse(userData));
			}
		} catch (error) {
			console.error('加载用户信息失败:', error);
		}
	};

	const handleBarCodeScanned = ({
		type,
		data,
	}: {
		type: string;
		data: string;
	}) => {
		if (scanned) return;

		setScanned(true);

		// 处理二维码数据
		if (data.includes('qr-login')) {
			// 处理登录二维码
			handleLoginQR(data);
		} else {
			// 其他二维码
			CustomAlert.info('扫描结果', `类型: ${type}\n内容: ${data}`, [
				{
					text: '确定',
					onPress: () => setScanned(false),
				},
			]);
		}
	};

	const handleLoginQR = async (data: string) => {
		try {
			// 检查用户是否已登录
			if (!userInfo) {
				setConfirmData({
					qrCodeId: '',
					webDomain: '',
					isError: true,
					errorType: 'notLoggedIn',
					errorMessage: '请先登录后再扫描网页端登录二维码',
				});
				setShowConfirmModal(true);
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}).start();
				return;
			}

			// 解析二维码中的登录信息
			const url = new URL(data);
			const qrCodeId = url.searchParams.get('qrCodeId');
			const webDomain = url.hostname;

			if (qrCodeId) {
				// 先调用扫描接口，通知网页端二维码已被扫描
				try {
					const scanResponse = await apiMethods.scanQrCode(qrCodeId);

					if (
						scanResponse.status === 200 ||
						(scanResponse.status === 201 && scanResponse.data.success)
					) {
						// 保存当前扫描的二维码ID
						setCurrentQrCodeId(qrCodeId);
						// 跳转到确认登录页面
						router.push({
							pathname: '/confirm-login',
							params: {
								qrData: JSON.stringify({
									website: webDomain,
									token: qrCodeId,
								}),
							},
						});
					} else {
						setConfirmData({
							qrCodeId: '',
							webDomain: '',
							isError: true,
							errorType: 'invalidQR',
							errorMessage: scanResponse.data?.message || '扫描失败',
						});
						setShowConfirmModal(true);
						Animated.timing(fadeAnim, {
							toValue: 1,
							duration: 300,
							useNativeDriver: true,
						}).start();
					}
				} catch (scanError: any) {
					console.error('扫描接口调用失败:', scanError);
					setConfirmData({
						qrCodeId: '',
						webDomain: '',
						isError: true,
						errorType: 'invalidQR',
						errorMessage:
							scanError.response?.data?.message || '网络错误，请重试',
					});
					setShowConfirmModal(true);
					Animated.timing(fadeAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}).start();
				}
			} else {
				setConfirmData({
					qrCodeId: '',
					webDomain: '',
					isError: true,
					errorType: 'invalidQR',
					errorMessage: '无效的登录二维码',
				});
				setShowConfirmModal(true);
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}).start();
			}
		} catch (error) {
			console.error('解析二维码失败:', error);
			setConfirmData({
				qrCodeId: '',
				webDomain: '',
				isError: true,
				errorType: 'formatError',
				errorMessage: '二维码格式不正确',
			});
			setShowConfirmModal(true);
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}
	};

	const confirmLogin = async () => {
		if (!confirmData || !userInfo) return;

		setIsConfirming(true);

		try {
			const token = await AsyncStorage.getItem('userToken');
			if (!token) {
				CustomAlert.error('错误', '用户token不存在');
				return;
			}

			const response = await apiMethods.confirmQrLogin(confirmData.qrCodeId);

			if (response.status === 200 || response.status === 201) {
				closeConfirmModal();
				router.push('/(tabs)/profile');
			} else {
				CustomAlert.error('登录失败', '确认登录失败');
			}
		} catch (error: any) {
			console.error('确认登录错误:', error);
			const errorMessage =
				error.response?.data?.message || '网络请求失败，请检查网络连接';
			CustomAlert.error('错误', errorMessage);
		} finally {
			setIsConfirming(false);
		}
	};

	const closeConfirmModal = async () => {
		// 如果有已扫描的二维码，先取消扫码
		if (currentQrCodeId) {
			try {
				await apiMethods.cancelQrCodeScan(currentQrCodeId);
			} catch (error) {
				console.error('取消扫码失败:', error);
			}
			setCurrentQrCodeId(null);
		}
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start(() => {
			setShowConfirmModal(false);
			setConfirmData(null);
			setScanned(false);
		});
	};

	const toggleFlash = () => {
		setFlashOn(!flashOn);
	};

	const goBack = async () => {
		// 如果有已扫描的二维码，先取消扫码
		if (currentQrCodeId) {
			try {
				await apiMethods.cancelQrCodeScan(currentQrCodeId);
			} catch (error) {
				console.error('取消扫码失败:', error);
				// 即使取消接口失败，也允许用户返回
			}
			setCurrentQrCodeId(null);
		}
		router.back();
	};

	if (!permission) {
		return (
			<View style={[styles.container, { backgroundColor: colors.background }]}>
				<Text style={[styles.message, { color: colors.text }]}>
					请求相机权限中...
				</Text>
			</View>
		);
	}

	if (!permission.granted) {
		return (
			<View style={[styles.container, { backgroundColor: colors.background }]}>
				<Text style={[styles.message, { color: colors.text }]}>
					需要相机权限才能扫描二维码
				</Text>
				<TouchableOpacity
					style={[styles.permissionButton, { backgroundColor: colors.primary }]}
					onPress={requestPermission}
				>
					<Text style={styles.permissionButtonText}>授予权限</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<CameraView
				style={styles.camera}
				facing='back'
				flash={flashOn ? 'on' : 'off'}
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ['qr'],
				}}
			/>

			{/* 扫描框覆盖层 */}
			<View style={styles.overlay}>
				{/* 顶部工具栏 */}
				<View style={styles.topBar}>
					<TouchableOpacity style={styles.backButton} onPress={goBack}>
						<Ionicons name='arrow-back' size={24} color='white' />
					</TouchableOpacity>
					<Text style={styles.title}>扫描网页端登录二维码</Text>
					<TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
						<Ionicons
							name={flashOn ? 'flash' : 'flash-off'}
							size={24}
							color='white'
						/>
					</TouchableOpacity>
				</View>

				{/* 扫描区域 */}
				<View style={styles.scanArea}>
					<View style={styles.scanFrame}>
						{/* 四个角的装饰 */}
						<View style={[styles.corner, styles.topLeft]} />
						<View style={[styles.corner, styles.topRight]} />
						<View style={[styles.corner, styles.bottomLeft]} />
						<View style={[styles.corner, styles.bottomRight]} />
					</View>
				</View>

				{/* 底部提示 */}
				<View style={styles.bottomBar}>
					<Text style={styles.hint}>将网页端的登录二维码放入框内进行扫描</Text>
					{scanned && (
						<TouchableOpacity
							style={[styles.rescanButton, { backgroundColor: colors.primary }]}
							onPress={() => setScanned(false)}
						>
							<Text style={styles.rescanButtonText}>重新扫描</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* 加藤惠风格确认弹窗 */}
			<Modal
				visible={showConfirmModal}
				transparent={true}
				animationType='none'
				onRequestClose={closeConfirmModal}
			>
				<View style={styles.modalOverlay}>
					<Animated.View
						style={[
							styles.modalContainer,
							{
								opacity: fadeAnim,
								transform: [
									{
										scale: fadeAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [0.8, 1],
										}),
									},
								],
							},
						]}
					>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>
								{confirmData?.isError ? '提示' : '确认网页端登录'}
							</Text>
						</View>

						<View style={styles.modalContent}>
							{confirmData?.isError ? (
								<>
									<View style={styles.infoRow}>
										<Ionicons
											name='warning-outline'
											size={20}
											color='#ff6b9d'
										/>
										<Text style={styles.infoLabel}>错误:</Text>
										<Text style={styles.infoValue}>
											{confirmData.errorMessage}
										</Text>
									</View>

									<Text style={styles.confirmText}>
										{confirmData.errorType === 'notLoggedIn'
											? '请先登录后再使用扫码功能。'
											: '请重新扫描有效的登录二维码。'}
									</Text>
								</>
							) : (
								<>
									<View style={styles.infoRow}>
										<Ionicons name='globe-outline' size={20} color='#ff6b9d' />
										<Text style={styles.infoLabel}>网站:</Text>
										<Text style={styles.infoValue}>
											{confirmData?.webDomain}
										</Text>
									</View>

									<View style={styles.infoRow}>
										<Ionicons name='person-outline' size={20} color='#ff6b9d' />
										<Text style={styles.infoLabel}>用户:</Text>
										<Text style={styles.infoValue}>{userInfo?.username}</Text>
									</View>

									<Text style={styles.confirmText}>
										是否确认使用当前账号登录网页端？
									</Text>
								</>
							)}
						</View>

						<View style={styles.modalButtons}>
							{confirmData?.isError ? (
								<TouchableOpacity
									style={[
										styles.modalButton,
										styles.confirmButton,
										{ borderBottomLeftRadius: 20 },
									]}
									onPress={() => {
										closeConfirmModal();
										if (confirmData.errorType === 'notLoggedIn') {
											router.back();
										} else {
											setScanned(false);
										}
									}}
								>
									<Text style={styles.confirmButtonText}>确定</Text>
								</TouchableOpacity>
							) : (
								<>
									<TouchableOpacity
										style={[styles.modalButton, styles.cancelButton]}
										onPress={closeConfirmModal}
										disabled={isConfirming}
									>
										<Text style={styles.cancelButtonText}>取消</Text>
									</TouchableOpacity>

									<TouchableOpacity
										style={[styles.modalButton, styles.confirmButton]}
										onPress={confirmLogin}
										disabled={isConfirming}
									>
										{isConfirming ? (
											<Text style={styles.confirmButtonText}>确认中...</Text>
										) : (
											<Text style={styles.confirmButtonText}>确认登录</Text>
										)}
									</TouchableOpacity>
								</>
							)}
						</View>
					</Animated.View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'space-between',
	},
	topBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	backButton: {
		padding: 8,
	},
	title: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	flashButton: {
		padding: 8,
	},
	scanArea: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scanFrame: {
		width: scanAreaSize,
		height: scanAreaSize,
		position: 'relative',
	},
	corner: {
		position: 'absolute',
		width: 30,
		height: 30,
		borderColor: '#ff6b9d',
		borderWidth: 3,
	},
	topLeft: {
		top: 0,
		left: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
	},
	topRight: {
		top: 0,
		right: 0,
		borderLeftWidth: 0,
		borderBottomWidth: 0,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderLeftWidth: 0,
		borderTopWidth: 0,
	},
	bottomBar: {
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingBottom: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	hint: {
		color: 'white',
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 20,
	},
	rescanButton: {
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderRadius: 20,
	},
	rescanButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	message: {
		textAlign: 'center',
		fontSize: 16,
		marginBottom: 20,
	},
	permissionButton: {
		paddingHorizontal: 30,
		paddingVertical: 15,
		borderRadius: 25,
		alignSelf: 'center',
	},
	permissionButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	// 弹窗样式
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	modalContainer: {
		backgroundColor: 'white',
		borderRadius: 20,
		width: '100%',
		maxWidth: 350,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 10,
	},
	modalHeader: {
		backgroundColor: '#ff6b9d',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 24,
		alignItems: 'center',
	},
	modalTitle: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	modalContent: {
		paddingHorizontal: 24,
		paddingVertical: 20,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	infoLabel: {
		fontSize: 16,
		color: '#666',
		marginLeft: 8,
		marginRight: 8,
		fontWeight: '500',
	},
	infoValue: {
		fontSize: 16,
		color: '#333',
		fontWeight: 'bold',
		flex: 1,
	},
	confirmText: {
		fontSize: 16,
		color: '#333',
		textAlign: 'center',
		marginTop: 16,
		lineHeight: 24,
	},
	modalButtons: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
	},
	modalButton: {
		flex: 1,
		paddingVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cancelButton: {
		borderRightWidth: 1,
		borderRightColor: '#f0f0f0',
	},
	confirmButton: {
		backgroundColor: '#ff6b9d',
		borderBottomRightRadius: 20,
	},
	cancelButtonText: {
		fontSize: 16,
		color: '#666',
		fontWeight: '500',
	},
	confirmButtonText: {
		fontSize: 16,
		color: 'white',
		fontWeight: 'bold',
	},
});
