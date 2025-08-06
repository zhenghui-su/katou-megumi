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
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 如果是401错误，清除token并跳转到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    return Promise.reject(error);
  },
);

export default api;

// API接口定义
export const authAPI = {
  // 登录
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),

  // 获取个人资料
  getProfile: () => api.get('/auth/profile'),

  // 更新个人资料
  updateProfile: (data: {
    nickname?: string;
    email?: string;
    avatar?: string;
    password?: string;
  }) => api.put('/auth/profile', data),
};

export const adminAPI = {
  // 获取统计数据
  getStats: () => api.get('/admin/stats'),
  // 获取仪表盘数据
  getDashboardData: () => api.get('/admin/dashboard'),
};

export const reviewAPI = {
  // 获取待审核图片列表
  getPendingImages: (params: {
    status: string;
    page: number;
    limit: number;
    category?: string;
  }) => {
    const { status, page, limit, category } = params;
    let url = `/review/pending?status=${status}&page=${page}&limit=${limit}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    return api.get(url);
  },

  // 获取审核统计
  getStats: () => api.get('/review/stats'),

  // 审核通过图片
  approveImage: (
    id: number,
    data: {
      title?: string;
      description?: string;
      category?: string;
    },
  ) => api.post(`/review/approve/${id}`, data),

  // 审核拒绝图片
  rejectImage: (
    id: number,
    data: {
      reason?: string;
    },
  ) => api.post(`/review/reject/${id}`, data),
};

export const notificationAPI = {
  // 发送系统通知
  createSystemNotification: (data: { title: string; content: string }) =>
    api.post('/notifications/system', data),
};

export const userAPI = {
  // 获取用户列表
  getUsers: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }) => api.get('/users', { params }),

  // 获取单个用户
  getUserById: (id: string) => api.get(`/users/${id}`),

  // 创建用户
  createUser: (data: {
    username: string;
    email: string;
    nickname: string;
    password: string;
    role: 'admin' | 'user' | 'moderator';
    status: 'active' | 'inactive' | 'banned';
  }) => api.post('/users', data),

  // 更新用户
  updateUser: (
    id: string,
    data: {
      username?: string;
      email?: string;
      nickname?: string;
      role?: 'admin' | 'user' | 'moderator';
      status?: 'active' | 'inactive' | 'banned';
    },
  ) => api.put(`/users/${id}`, data),

  // 删除用户
  deleteUser: (id: string) => api.delete(`/users/${id}`),

  // 重置密码
  resetPassword: (id: string, data: { password: string }) =>
    api.post(`/users/${id}/reset-password`, data),

  // 批量操作用户
  batchUpdateUsers: (data: {
    userIds: string[];
    action: 'activate' | 'deactivate' | 'ban' | 'delete';
  }) => api.post('/users/batch', data),

  // 获取用户统计
  getUserStats: () => api.get('/users/stats'),
};

export const uploadAPI = {
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

export const musicAPI = {
  // 获取音乐列表
  getMusic: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => api.get('/music', { params }),

  // 获取单个音乐
  getMusicById: (id: number) => api.get(`/music/${id}`),

  // 创建音乐
  createMusic: (data: {
    title: string;
    artist: string;
    src: string;
    duration?: number;
    cover?: string;
    category?: string;
    description?: string;
  }) => api.post('/music', data),

  // 更新音乐
  updateMusic: (
    id: number,
    data: {
      title?: string;
      artist?: string;
      src?: string;
      duration?: number;
      cover?: string;
      category?: string;
      description?: string;
    },
  ) => api.patch(`/music/${id}`, data),

  // 删除音乐
  deleteMusic: (id: number) => api.delete(`/music/${id}`),

  // 增加播放次数
  incrementPlayCount: (id: number) => api.post(`/music/${id}/play`),

  // 上传音乐文件
  uploadMusic: (formData: FormData) =>
    api.post('/upload/music', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 删除文件
  deleteFile: (fileUrl: string) =>
    api.delete('/upload/file', {
      params: {
        url: fileUrl,
      },
    }),
};
