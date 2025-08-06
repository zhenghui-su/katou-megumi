import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GalleryImage, MessageState, UploadedFile } from '../types/gallery';
import { galleryAPI } from '../utils/api';

export const useGallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 获取已通过审核的图片
  const fetchImages = async (category?: string) => {
    try {
      setLoading(true);
      let response;
      if (category && category !== 'all') {
        // 使用分类专用接口
        response = await galleryAPI.getImagesByCategory(category);
      } else {
        // 获取所有图片
        response = await galleryAPI.getImages();
      }
      if (response.data.success) {
        // 处理不同接口返回的数据结构
        const imageData =
          response.data.data?.images || response.data.data || [];
        setImages(imageData);
      }
    } catch (error) {
      console.error('获取图片错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取图片和处理URL参数
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'all';
    setSelectedCategory(categoryFromUrl);
    fetchImages(categoryFromUrl);
  }, [searchParams]);

  // 处理分类切换
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
    fetchImages(category);
  };

  const handleUploadSuccess = (files: UploadedFile[]) => {
    setMessage({
      type: 'info',
      text: `成功上传 ${files.length} 个文件！图片已提交审核，审核通过后将显示在画廊中。`,
    });
    setTimeout(() => setMessage(null), 5000);
    setUploadDialogOpen(false);
    // 上传成功后可以选择刷新图片列表（如果需要显示最新审核通过的图片）
    // fetchImages();
  };

  const handleUploadError = (error: string) => {
    setMessage({
      type: 'error',
      text: `上传失败: ${error}`,
    });
    setTimeout(() => setMessage(null), 5000);
  };

  return {
    // State
    uploadDialogOpen,
    message,
    images,
    loading,
    selectedCategory,
    
    // Actions
    setUploadDialogOpen,
    setMessage,
    handleCategoryChange,
    handleUploadSuccess,
    handleUploadError,
    fetchImages,
  };
};