export interface UploadedFile {
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  tags?: string[];
  views: number;
  likes: number;
  createdAt: string;
  uploadedBy?: string;
}

export interface CategoryInfo {
  key: string;
  label: string;
  color: string;
}

export interface MessageState {
  type: 'success' | 'error' | 'info';
  text: string;
}