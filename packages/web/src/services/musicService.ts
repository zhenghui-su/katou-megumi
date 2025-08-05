import axios from 'axios';
import { Track } from '@katou-megumi/shared';

// API 基础 URL
const API_BASE_URL = 'http://localhost:8080';

// 音乐 API 服务
export const musicService = {
  // 获取所有音乐
  getAllMusic: async (): Promise<Track[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/music`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch music:', error);
      return [];
    }
  },

  // 按分类获取音乐
  getMusicByCategory: async (category: string): Promise<Track[]> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/music/category/${category}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch music by category:', error);
      return [];
    }
  },

  // 获取单个音乐
  getMusicById: async (id: number): Promise<Track | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/music/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch music by id:', error);
      return null;
    }
  },

  // 上传音乐文件
  uploadMusic: async (
    file: File,
    metadata: {
      title: string;
      artist: string;
      category?: string;
      description?: string;
    },
    token: string
  ): Promise<Track | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', metadata.title);
      formData.append('artist', metadata.artist);
      if (metadata.category) {
        formData.append('category', metadata.category);
      }
      if (metadata.description) {
        formData.append('description', metadata.description);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/upload/music`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data || null;
    } catch (error) {
      console.error('Failed to upload music:', error);
      throw error;
    }
  },
};

export default musicService;
