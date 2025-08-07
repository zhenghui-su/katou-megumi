/**
 * 数据获取相关的服务函数
 */

import { worksAPI, videosAPI, galleryAPI } from '../utils/api';
import { Work, Video } from '../types/home';

// 内部 API 调用函数
const fetchWorks = async (): Promise<Work[]> => {
  try {
    const response = await worksAPI.getWorks();
    return response.data.data.works || [];
  } catch (error) {
    console.error('获取作品数据失败:', error);
    return [];
  }
};

const fetchVideos = async (): Promise<Video[]> => {
  try {
    const response = await videosAPI.getVideos();
    return response.data.data.videos || [];
  } catch (error) {
    console.error('获取视频数据失败:', error);
    return [];
  }
};

// 获取预览图片
const fetchPreviewImages = async (): Promise<{
  official?: string;
  anime?: string;
  wallpaper?: string;
  fanart?: string;
}> => {
  try {
    const categories = ['official', 'anime', 'wallpaper', 'fanart'];
    const imagePromises = categories.map(async (category) => {
      try {
        const response = await galleryAPI.getImages({ category, limit: 1 });
        if (response.data.success && response.data.data.length > 0) {
          return { category, url: response.data.data[0].url };
        }
      } catch (error) {
        console.error(`获取${category}分类图片失败:`, error);
      }
      return { category, url: null };
    });

    const results = await Promise.all(imagePromises);
    const imageMap: any = {};
    results.forEach(({ category, url }) => {
      if (url) {
        imageMap[category] = url;
      }
    });
    return imageMap;
  } catch (error) {
    console.error('获取预览图片失败:', error);
    return {};
  }
};

// 组合数据获取函数
export const fetchHomeData = async () => {
  const [works, videos, previewImages] = await Promise.all([
    fetchWorks(),
    fetchVideos(),
    fetchPreviewImages(),
  ]);

  return {
    works,
    videos,
    previewImages,
  };
};