import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ScrollView,
	Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCallback } from 'react';

interface UserInfo {
	id: string;
	username: string;
	email: string;
	nickname?: string;
	avatar?: string;
}

export default function ProfileScreen() {
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? 'light'];
	const router = useRouter();
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkLoginStatus();
	}, []);

	// 监听页面焦点变化，确保从其他页面返回时刷新登录状态
	useFocusEffect(
		useCallback(() => {
			checkLoginStatus();
		}, [])
	);

	const checkLoginStatus = async () => {
		try {
			const token = await AsyncStorage.getItem('userToken');
			const userData = await AsyncStorage.getItem('userInfo');
			console.log(userInfo);
			if (token && userData) {
				setIsLoggedIn(true);
				setUserInfo(JSON.parse(userData));
			} else {
				setIsLoggedIn(false);
				setUserInfo(null);
			}
		} catch (error) {
			console.error('检查登录状态失败:', error);
			setIsLoggedIn(false);
		} finally {
			setLoading(false);
		}
	};

	const handleScanWebQR = () => {
		// 扫描网页端的登录二维码
		router.push('/scanner');
	};

	const handleLogin = () => {
		router.push('/login');
	};

	const handleLogout = async () => {
		Alert.alert('确认退出', '您确定要退出登录吗？', [
			{ text: '取消', style: 'cancel' },
			{
				text: '确定',
				style: 'destructive',
				onPress: async () => {
					try {
						await AsyncStorage.multiRemove(['userToken', 'userInfo']);
						setIsLoggedIn(false);
						setUserInfo(null);
					} catch (error) {
						console.error('退出登录失败:', error);
					}
				},
			},
		]);
	};

	const renderLoginPrompt = () => (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<View
				style={[styles.loginPromptContainer, { backgroundColor: colors.card }]}
			>
				<View
					style={[
						styles.avatarPlaceholder,
						{ backgroundColor: colors.secondary },
					]}
				>
					<Ionicons name='person' size={60} color={colors.primary} />
				</View>
				<Text style={[styles.loginTitle, { color: colors.text }]}>
					欢迎来到加藤惠的世界
				</Text>
				<Text style={[styles.loginSubtitle, { color: colors.icon }]}>
					登录后可以享受更多功能
				</Text>
				<TouchableOpacity
					style={[styles.loginButton, { backgroundColor: colors.primary }]}
					onPress={handleLogin}
				>
					<Text style={styles.loginButtonText}>立即登录</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderUserProfile = () => (
		<ScrollView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
				<View style={styles.avatarContainer}>
					{userInfo?.avatar ? (
						<Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
					) : (
						<View
							style={[
								styles.avatar,
								{
									backgroundColor: colors.secondary,
									justifyContent: 'center',
									alignItems: 'center',
								},
							]}
						>
							<Ionicons name='person' size={40} color={colors.primary} />
						</View>
					)}
				</View>
				<Text style={[styles.username, { color: colors.text }]}>
					{userInfo?.nickname}
				</Text>
				<Text style={[styles.email, { color: colors.icon }]}>
					{userInfo?.email}
				</Text>
			</View>

			<View style={[styles.menuSection, { backgroundColor: colors.card }]}>
				<TouchableOpacity style={styles.menuItem}>
					<Ionicons name='settings-outline' size={24} color={colors.icon} />
					<Text style={[styles.menuText, { color: colors.text }]}>设置</Text>
					<Ionicons name='chevron-forward' size={20} color={colors.icon} />
				</TouchableOpacity>

				<TouchableOpacity style={styles.menuItem}>
					<Ionicons name='help-circle-outline' size={24} color={colors.icon} />
					<Text style={[styles.menuText, { color: colors.text }]}>
						帮助与反馈
					</Text>
					<Ionicons name='chevron-forward' size={20} color={colors.icon} />
				</TouchableOpacity>

				<TouchableOpacity style={styles.menuItem}>
					<Ionicons
						name='information-circle-outline'
						size={24}
						color={colors.icon}
					/>
					<Text style={[styles.menuText, { color: colors.text }]}>关于</Text>
					<Ionicons name='chevron-forward' size={20} color={colors.icon} />
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				style={[styles.logoutButton, { backgroundColor: colors.surface }]}
				onPress={handleLogout}
			>
				<Text style={[styles.logoutText, { color: colors.primary }]}>
					退出登录
				</Text>
			</TouchableOpacity>
		</ScrollView>
	);

	if (loading) {
		return (
			<View
				style={[
					styles.loadingContainer,
					{ backgroundColor: colors.background },
				]}
			>
				<Text style={[styles.loadingText, { color: colors.text }]}>
					加载中...
				</Text>
			</View>
		);
	}

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: colors.background }]}
		>
			<View style={[styles.header, { backgroundColor: colors.card }]}>
				<Text style={[styles.headerTitle, { color: colors.text }]}>
					个人资料
				</Text>
				{isLoggedIn && (
					<TouchableOpacity style={styles.scanButton} onPress={handleScanWebQR}>
						<Ionicons name='qr-code-outline' size={24} color={colors.primary} />
					</TouchableOpacity>
				)}
			</View>
			{isLoggedIn ? renderUserProfile() : renderLoginPrompt()}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	scanButton: {
		padding: 8,
	},
	loginPromptContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 20,
		padding: 40,
		borderRadius: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	avatarPlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	loginTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
	},
	loginSubtitle: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 30,
	},
	loginButton: {
		paddingHorizontal: 40,
		paddingVertical: 15,
		borderRadius: 25,
	},
	loginButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	profileHeader: {
		alignItems: 'center',
		padding: 30,
		margin: 20,
		borderRadius: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	avatarContainer: {
		marginBottom: 15,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	username: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	email: {
		fontSize: 16,
	},
	menuSection: {
		margin: 20,
		borderRadius: 15,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	menuText: {
		flex: 1,
		fontSize: 16,
		marginLeft: 15,
	},
	logoutButton: {
		margin: 20,
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
	},
	logoutText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
});
