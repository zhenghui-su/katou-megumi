import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 如果是401错误，清除token
    if (error.response?.status === 401) {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
      // 可以在这里触发登录弹窗或跳转
    }
    return Promise.reject(error);
  }
);

export default api;

// API接口定义
export const authAPI = {
  // 用户登录
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),

  // 用户注册
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  // 获取用户信息
  getProfile: () => api.post('/auth/profile'),

  // 二维码相关接口
  generateQrCode: () => api.post('/auth/qr-code/generate'),
  checkQrCodeStatus: (qrCodeId: string) =>
    api.get(`/auth/qr-code/status/${qrCodeId}`),
  confirmQrCodeLogin: (data: { qrCodeId: string; token: string }) =>
    api.post('/auth/qr-code/confirm', data),
};

export const galleryAPI = {
  // 获取画廊图片
  getImages: (params?: { page?: number; limit?: number; category?: string }) =>
    api.get('/gallery', { params }),

  // 获取指定分类图片
  getImagesByCategory: (
    category: string,
    params?: { page?: number; limit?: number }
  ) => api.get(`/gallery/${category}`, { params }),

  // 获取单张图片详情
  getImageDetail: (category: string, id: number) =>
    api.get(`/gallery/${category}/${id}`),
};

export const worksAPI = {
  // 获取作品列表
  getWorks: () => api.get('/works'),
};

export const videosAPI = {
  // 获取视频列表
  getVideos: () => api.get('/videos'),
};

export const notificationAPI = {
  // 获取用户通知列表
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),

  // 获取未读通知数量
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // 标记通知为已读
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),

  // 标记所有通知为已读
  markAllAsRead: () => api.put('/notifications/read-all'),

  // 删除通知
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
};

export const uploadAPI = {
  // 单文件上传（需要认证）
  uploadSingle: (formData: FormData) =>
    api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 多文件上传（需要认证）
  uploadMultiple: (formData: FormData) =>
    api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 公共单文件上传（无需认证）
  uploadPublicSingle: (formData: FormData) =>
    api.post('/upload/public/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 公共多文件上传（无需认证）
  uploadPublicMultiple: (formData: FormData) =>
    api.post('/upload/public/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
