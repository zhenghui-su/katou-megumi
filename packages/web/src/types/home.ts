// 类型定义
export interface Work {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  year: string;
  type: string;
  poster?: string;
  thumbnail?: string;
  rating: number;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  duration: string;
  views: number;
  likes: number;
}