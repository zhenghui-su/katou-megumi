export interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'system' | 'review' | 'user';
  isRead: boolean;
  metadata?: any;
  sender?: {
    id: number;
    username: string;
  } | null;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}