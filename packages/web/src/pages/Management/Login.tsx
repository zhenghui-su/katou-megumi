import React, { useState } from 'react';
import {
	Box,
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Alert,
	Tab,
	Tabs,
	InputAdornment,
	IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`auth-tabpanel-${index}`}
			aria-labelledby={`auth-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
		</div>
	);
}

const Login: React.FC = () => {
	const navigate = useNavigate();
	const [tabValue, setTabValue] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// 登录表单状态
	const [loginForm, setLoginForm] = useState({
		username: '',
		password: '',
	});

	// 注册表单状态
	const [registerForm, setRegisterForm] = useState({
		username: '',
		password: '',
		confirmPassword: '',
		email: '',
	});

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
		setError('');
		setSuccess('');
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('http://localhost:8080/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(loginForm),
			});

			const data = await response.json();

			if (response.ok) {
				// 保存token到localStorage
				localStorage.setItem('admin_token', data.data.token);
				localStorage.setItem('admin_user', JSON.stringify(data.data.user));
				// 跳转到管理后台主页
				navigate('/management/dashboard');
			} else {
				setError(data.message || '登录失败');
			}
		} catch (error) {
			setError('网络错误，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		if (registerForm.password !== registerForm.confirmPassword) {
			setError('两次输入的密码不一致');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('http://localhost:8080/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: registerForm.username,
					password: registerForm.password,
					email: registerForm.email,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccess('注册成功！请切换到登录页面');
				setRegisterForm({
					username: '',
					password: '',
					confirmPassword: '',
					email: '',
				});
				// 3秒后自动切换到登录页面
				setTimeout(() => {
					setTabValue(0);
					setSuccess('');
				}, 3000);
			} else {
				setError(data.message || '注册失败');
			}
		} catch (error) {
			setError('网络错误，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				background:
					'linear-gradient(135deg, #ff6b9d 0%, #ff8cc8 50%, #ffb3d9 100%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 2,
			}}
		>
			<Container maxWidth='sm'>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<Paper
						elevation={24}
						sx={{
							p: 4,
							borderRadius: 4,
							backdrop: 'blur(10px)',
							backgroundColor: 'rgba(255, 255, 255, 0.95)',
						}}
					>
						{/* 标题 */}
						<Box sx={{ textAlign: 'center', mb: 3 }}>
							<Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
							<Typography
								variant='h4'
								component='h1'
								sx={{ fontWeight: 'bold', color: 'primary.main' }}
							>
								管理后台
							</Typography>
							<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
								加藤惠粉丝网站管理系统
							</Typography>
						</Box>

						{/* 错误和成功提示 */}
						{error && (
							<Alert severity='error' sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}
						{success && (
							<Alert severity='success' sx={{ mb: 2 }}>
								{success}
							</Alert>
						)}

						{/* 选项卡 */}
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							centered
							sx={{ mb: 2 }}
						>
							<Tab label='登录' />
							<Tab label='注册' />
						</Tabs>

						{/* 登录表单 */}
						<TabPanel value={tabValue} index={0}>
							<Box component='form' onSubmit={handleLogin}>
								<TextField
									fullWidth
									label='用户名'
									variant='outlined'
									margin='normal'
									required
									value={loginForm.username}
									onChange={(e) =>
										setLoginForm({ ...loginForm, username: e.target.value })
									}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Person color='primary' />
											</InputAdornment>
										),
									}}
								/>
								<TextField
									fullWidth
									label='密码'
									type={showPassword ? 'text' : 'password'}
									variant='outlined'
									margin='normal'
									required
									value={loginForm.password}
									onChange={(e) =>
										setLoginForm({ ...loginForm, password: e.target.value })
									}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Lock color='primary' />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position='end'>
												<IconButton
													onClick={() => setShowPassword(!showPassword)}
													edge='end'
												>
													{showPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
								<Button
									type='submit'
									fullWidth
									variant='contained'
									size='large'
									loading={loading}
									sx={{ mt: 3, mb: 2, py: 1.5 }}
								>
									{loading ? '登录中...' : '登录'}
								</Button>
							</Box>
						</TabPanel>

						{/* 注册表单 */}
						<TabPanel value={tabValue} index={1}>
							<Box component='form' onSubmit={handleRegister}>
								<TextField
									fullWidth
									label='用户名'
									variant='outlined'
									margin='normal'
									required
									value={registerForm.username}
									onChange={(e) =>
										setRegisterForm({
											...registerForm,
											username: e.target.value,
										})
									}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Person color='primary' />
											</InputAdornment>
										),
									}}
								/>
								<TextField
									fullWidth
									label='邮箱'
									type='email'
									variant='outlined'
									margin='normal'
									required
									value={registerForm.email}
									onChange={(e) =>
										setRegisterForm({ ...registerForm, email: e.target.value })
									}
								/>
								<TextField
									fullWidth
									label='密码'
									type={showPassword ? 'text' : 'password'}
									variant='outlined'
									margin='normal'
									required
									value={registerForm.password}
									onChange={(e) =>
										setRegisterForm({
											...registerForm,
											password: e.target.value,
										})
									}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Lock color='primary' />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position='end'>
												<IconButton
													onClick={() => setShowPassword(!showPassword)}
													edge='end'
												>
													{showPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
								<TextField
									fullWidth
									label='确认密码'
									type={showPassword ? 'text' : 'password'}
									variant='outlined'
									margin='normal'
									required
									value={registerForm.confirmPassword}
									onChange={(e) =>
										setRegisterForm({
											...registerForm,
											confirmPassword: e.target.value,
										})
									}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Lock color='primary' />
											</InputAdornment>
										),
									}}
								/>
								<Button
									type='submit'
									fullWidth
									variant='contained'
									size='large'
									loading={loading}
									sx={{ mt: 3, mb: 2, py: 1.5 }}
								>
									{loading ? '注册中...' : '注册'}
								</Button>
							</Box>
						</TabPanel>
					</Paper>
				</motion.div>
			</Container>
		</Box>
	);
};

export default Login;
