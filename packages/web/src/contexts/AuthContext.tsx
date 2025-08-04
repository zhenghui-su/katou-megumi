import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';

interface User {
	id: number;
	username: string;
	email: string;
	role: 'admin' | 'user';
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	login: (username: string, password: string) => Promise<boolean>;
	register: (
		username: string,
		email: string,
		password: string
	) => Promise<boolean>;
	logout: () => void;
	loading: boolean;
	error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 检查本地存储的token
	useEffect(() => {
		const savedToken = localStorage.getItem('user_token');
		const savedUser = localStorage.getItem('user_data');

		if (savedToken && savedUser) {
			try {
				setToken(savedToken);
				setUser(JSON.parse(savedUser));
			} catch (error) {
				console.error('解析用户数据失败:', error);
				localStorage.removeItem('user_token');
				localStorage.removeItem('user_data');
			}
		}
		setLoading(false);
	}, []);

	const login = async (
		username: string,
		password: string
	): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('http://localhost:8080/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (response.ok) {
				setToken(data.data.token);
				setUser(data.data.user);
				localStorage.setItem('user_token', data.data.token);
				localStorage.setItem('user_data', JSON.stringify(data.data.user));
				return true;
			} else {
				setError(data.message || '登录失败');
				return false;
			}
		} catch (error) {
			setError('网络错误，请稍后重试');
			return false;
		} finally {
			setLoading(false);
		}
	};

	const register = async (
		username: string,
		email: string,
		password: string
	): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('http://localhost:8080/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				return true;
			} else {
				setError(data.message || '注册失败');
				return false;
			}
		} catch (error) {
			setError('网络错误，请稍后重试');
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('user_token');
		localStorage.removeItem('user_data');
	};

	const value: AuthContextType = {
		user,
		token,
		isAuthenticated: !!user,
		login,
		register,
		logout,
		loading,
		error,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
