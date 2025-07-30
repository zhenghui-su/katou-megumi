import React, { useState } from 'react';
import {
	Box,
	TextField,
	Button,
	Typography,
	Alert,
	Tab,
	Tabs,
	InputAdornment,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';
import {
	Visibility,
	VisibilityOff,
	Lock,
	Person,
	Email,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

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

interface AuthDialogProps {
	open: boolean;
	onClose: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose }) => {
	const { login, register, loading, error } = useAuth();
	const [tabValue, setTabValue] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
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
		setSuccess('');
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await login(loginForm.username, loginForm.password);
		if (success) {
			onClose();
			setLoginForm({ username: '', password: '' });
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (registerForm.password !== registerForm.confirmPassword) {
			return;
		}

		const success = await register(
			registerForm.username,
			registerForm.email,
			registerForm.password
		);

		if (success) {
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
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
			<DialogTitle>
				<Box sx={{ textAlign: 'center' }}>
					<Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
					<Typography
						variant='h4'
						component='h1'
						sx={{ fontWeight: 'bold', color: 'primary.main' }}
					>
						用户认证
					</Typography>
					<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
						加藤惠粉丝网站
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent>
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
							disabled={loading}
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
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<Email color='primary' />
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
							error={
								registerForm.password !== registerForm.confirmPassword &&
								registerForm.confirmPassword !== ''
							}
							helperText={
								registerForm.password !== registerForm.confirmPassword &&
								registerForm.confirmPassword !== ''
									? '密码不一致'
									: ''
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
							disabled={
								loading ||
								registerForm.password !== registerForm.confirmPassword
							}
							sx={{ mt: 3, mb: 2, py: 1.5 }}
						>
							{loading ? '注册中...' : '注册'}
						</Button>
					</Box>
				</TabPanel>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>取消</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AuthDialog;
