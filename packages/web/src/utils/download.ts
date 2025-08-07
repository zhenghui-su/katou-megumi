/**
 * 文件下载相关的工具函数
 */

// 下载图片函数
export const downloadImage = async (
  imageUrl: string,
  filename: string = 'wallpaper.jpg'
) => {
  try {
    // 创建一个隐藏的iframe来下载图片，避免CORS问题
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = imageUrl;
    document.body.appendChild(iframe);

    // 延迟移除iframe
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);

    // 同时尝试直接下载
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // 添加到DOM并点击
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('下载图片失败:', error);
    // 备用方案：直接打开图片链接让用户手动保存
    window.open(imageUrl, '_blank');
  }
};