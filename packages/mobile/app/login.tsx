import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Alert,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { apiMethods } from '../utils/api';

export default function LoginScreen() {
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? 'light'];
	const router = useRouter();
	// 移除二维码登录类型，只保留表单登录
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleFormLogin = async () => {
		if (!username.trim() || !password.trim()) {
			Alert.alert('提示', '请输入用户名和密码');
			return;
		}

		setLoading(true);
		try {
			// 调用真实的登录API
			const response = await apiMethods.login(username, password);

			if (
				(response.status === 200 || response.status === 201) &&
				response.data.success
			) {
				const { user, token } = response.data.data;

				// 保存用户信息和token
				await AsyncStorage.setItem('userToken', token);
				await AsyncStorage.setItem(
					'userInfo',
					JSON.stringify({
						id: user.id,
						username: user.username,
						email: user.email,
						nickname: user.nickname,
						avatar: user.avatar,
					})
				);

				Alert.alert('登录成功', '欢迎回来！', [
					{
						text: '确定',
						onPress: () => {
							router.back();
						},
					},
				]);
			} else {
				Alert.alert('登录失败', response.data?.message || '用户名或密码错误');
			}
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || '网络错误，请稍后重试';
			Alert.alert('登录失败', errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// 移除二维码登录处理函数

	const goBack = () => {
		router.back();
	};

	const renderFormLogin = () => (
		<View style={styles.formContainer}>
			<View style={[styles.inputContainer, { borderColor: colors.primary }]}>
				<Ionicons
					name='person-outline'
					size={20}
					color={colors.icon}
					style={styles.inputIcon}
				/>
				<TextInput
					style={[styles.input, { color: colors.text }]}
					placeholder='用户名或邮箱'
					placeholderTextColor={colors.icon}
					value={username}
					onChangeText={setUsername}
					autoCapitalize='none'
					autoCorrect={false}
				/>
			</View>

			<View style={[styles.inputContainer, { borderColor: colors.primary }]}>
				<Ionicons
					name='lock-closed-outline'
					size={20}
					color={colors.icon}
					style={styles.inputIcon}
				/>
				<TextInput
					style={[styles.input, { color: colors.text }]}
					placeholder='密码'
					placeholderTextColor={colors.icon}
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!showPassword}
					autoCapitalize='none'
					autoCorrect={false}
				/>
				<TouchableOpacity
					style={styles.eyeButton}
					onPress={() => setShowPassword(!showPassword)}
				>
					<Ionicons
						name={showPassword ? 'eye-outline' : 'eye-off-outline'}
						size={20}
						color={colors.icon}
					/>
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				style={[styles.loginButton, { backgroundColor: colors.primary }]}
				onPress={handleFormLogin}
				disabled={loading}
			>
				<Text style={styles.loginButtonText}>
					{loading ? '登录中...' : '登录'}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.forgotPassword}>
				<Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
					忘记密码？
				</Text>
			</TouchableOpacity>
		</View>
	);

	// 移除二维码登录渲染函数

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<KeyboardAvoidingView
				style={styles.keyboardAvoid}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* 头部 */}
					<View style={[styles.header, { backgroundColor: colors.card }]}>
						<TouchableOpacity style={styles.backButton} onPress={goBack}>
							<Ionicons name='arrow-back' size={24} color={colors.text} />
						</TouchableOpacity>
						<Text style={[styles.headerTitle, { color: colors.text }]}>
							登录
						</Text>
						<View style={styles.placeholder} />
					</View>

					{/* 欢迎信息 */}
					<View style={styles.welcomeContainer}>
						<Text style={[styles.welcomeTitle, { color: colors.text }]}>
							欢迎回来
						</Text>
						<Text style={[styles.welcomeSubtitle, { color: colors.icon }]}>
							登录到加藤惠的世界
						</Text>
					</View>

					{/* 登录内容 */}
					<View
						style={[styles.contentContainer, { backgroundColor: colors.card }]}
					>
						{renderFormLogin()}
					</View>

					{/* 注册提示 */}
					<View style={styles.registerContainer}>
						<Text style={[styles.registerText, { color: colors.icon }]}>
							还没有账号？
						</Text>
						<TouchableOpacity>
							<Text style={[styles.registerLink, { color: colors.primary }]}>
								立即注册
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	keyboardAvoid: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
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
	backButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	placeholder: {
		width: 40,
	},
	welcomeContainer: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	welcomeTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	welcomeSubtitle: {
		fontSize: 16,
	},
	// 移除标签切换相关样式
	contentContainer: {
		margin: 20,
		borderRadius: 20,
		padding: 30,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	formContainer: {
		alignItems: 'center',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderRadius: 15,
		marginBottom: 20,
		paddingHorizontal: 15,
		height: 50,
	},
	inputIcon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		fontSize: 16,
	},
	eyeButton: {
		padding: 5,
	},
	loginButton: {
		width: '100%',
		paddingVertical: 15,
		borderRadius: 25,
		alignItems: 'center',
		marginTop: 10,
	},
	loginButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	forgotPassword: {
		marginTop: 20,
	},
	forgotPasswordText: {
		fontSize: 16,
	},
	// 移除二维码相关样式
	registerContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 30,
	},
	registerText: {
		fontSize: 16,
		marginRight: 5,
	},
	registerLink: {
		fontSize: 16,
		fontWeight: 'bold',
	},
});
