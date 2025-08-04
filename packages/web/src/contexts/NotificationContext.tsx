import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';
import {
	Notification,
	NotificationResponse,
	NotificationContextType,
} from '../types/notification';

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
);

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			'useNotification must be used within a NotificationProvider'
		);
	}
	return context;
};

interface NotificationProviderProps {
	children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
	children,
}) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);

	// 获取通知列表
	const fetchNotifications = async () => {
		const token = localStorage.getItem('token');
		if (!token) return;

		setLoading(true);
		try {
			const response = await fetch('http://localhost:8080/api/notifications', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				const notificationData: NotificationResponse = data.data;
				setNotifications(notificationData.notifications);
				setUnreadCount(notificationData.unreadCount);
			}
		} catch (error) {
			console.error('获取通知失败:', error);
		} finally {
			setLoading(false);
		}
	};

	// 获取未读通知数量
	const fetchUnreadCount = async () => {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await fetch(
				'http://localhost:8080/api/notifications/unread-count',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setUnreadCount(data.data.count);
			}
		} catch (error) {
			console.error('获取未读通知数量失败:', error);
		}
	};

	// 标记通知为已读
	const markAsRead = async (id: number) => {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await fetch(
				`http://localhost:8080/api/notifications/${id}/read`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				setNotifications((prev) =>
					prev.map((notification) =>
						notification.id === id
							? { ...notification, isRead: true }
							: notification
					)
				);
				setUnreadCount((prev) => Math.max(0, prev - 1));
			}
		} catch (error) {
			console.error('标记通知为已读失败:', error);
		}
	};

	// 标记所有通知为已读
	const markAllAsRead = async () => {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await fetch(
				'http://localhost:8080/api/notifications/read-all',
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				setNotifications((prev) =>
					prev.map((notification) => ({ ...notification, isRead: true }))
				);
				setUnreadCount(0);
			}
		} catch (error) {
			console.error('标记所有通知为已读失败:', error);
		}
	};

	// 删除通知
	const deleteNotification = async (id: number) => {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await fetch(
				`http://localhost:8080/api/notifications/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const deletedNotification = notifications.find((n) => n.id === id);
				setNotifications((prev) =>
					prev.filter((notification) => notification.id !== id)
				);
				if (deletedNotification && !deletedNotification.isRead) {
					setUnreadCount((prev) => Math.max(0, prev - 1));
				}
			}
		} catch (error) {
			console.error('删除通知失败:', error);
		}
	};

	// 定期获取未读通知数量
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			fetchUnreadCount();
			const interval = setInterval(fetchUnreadCount, 30000); // 每30秒检查一次
			return () => clearInterval(interval);
		}
	}, []);

	const value: NotificationContextType = {
		notifications,
		unreadCount,
		loading,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
		deleteNotification,
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};
