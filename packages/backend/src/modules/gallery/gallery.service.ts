import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../../entities/Image';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  // 模拟图片数据（当数据库连接失败时使用）
  private readonly mockGalleryData = {
    official: [
      {
        id: 1,
        title: '加藤惠官方立绘1',
        url: 'https://example.com/images/official/megumi1.jpg',
        thumbnailUrl: 'https://example.com/images/official/thumb/megumi1.jpg',
        description: '官方发布的高质量角色立绘',
        category: 'official',
        tags: ['官方', '立绘', '高清'],
        views: 0,
        likes: 0,
        createdAt: new Date(),
      },
      {
        id: 2,
        title: '加藤惠官方立绘2',
        url: 'https://example.com/images/official/megumi2.jpg',
        thumbnailUrl: 'https://example.com/images/official/thumb/megumi2.jpg',
        description: '官方发布的角色设定图',
        category: 'official',
        tags: ['官方', '设定图', '高清'],
        views: 0,
        likes: 0,
        createdAt: new Date(),
      },
    ],
    anime: [
      {
        id: 3,
        title: '动画截图1',
        url: 'https://example.com/images/anime/scene1.jpg',
        thumbnailUrl: 'https://example.com/images/anime/thumb/scene1.jpg',
        description: '第一季精彩场景截图',
        category: 'anime',
        tags: ['动画', '截图', '第一季'],
        views: 0,
        likes: 0,
        createdAt: new Date(),
      },
    ],
    wallpaper: [
      {
        id: 5,
        title: '加藤惠壁纸1',
        url: 'https://example.com/images/wallpaper/wp1.jpg',
        thumbnailUrl: 'https://example.com/images/wallpaper/thumb/wp1.jpg',
        description: '1920x1080高清壁纸',
        category: 'wallpaper',
        tags: ['壁纸', '高清', '1920x1080'],
        views: 0,
        likes: 0,
        createdAt: new Date(),
      },
    ],
    fanart: [
      {
        id: 7,
        title: '同人作品1',
        url: 'https://example.com/images/fanart/fan1.jpg',
        thumbnailUrl: 'https://example.com/images/fanart/thumb/fan1.jpg',
        description: '粉丝创作的精美同人图',
        category: 'fanart',
        tags: ['同人', '粉丝作品', '精美'],
        views: 0,
        likes: 0,
        createdAt: new Date(),
      },
    ],
  };

  async getAllImages(page: number = 1, limit: number = 10) {
    try {
      const [images, total] = await this.imageRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        images,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      // 数据库连接失败时返回空数据
      return {
        images: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async getImagesByCategory(
    category: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const [images, total] = await this.imageRepository.findAndCount({
        where: { category: category as any },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        category,
        images,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      // 数据库连接失败时返回模拟数据
      const mockData = this.mockGalleryData[category as keyof typeof this.mockGalleryData] || [];
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = mockData.slice(startIndex, endIndex);

      return {
        category,
        images: paginatedData,
        total: mockData.length,
        page,
        limit,
        totalPages: Math.ceil(mockData.length / limit),
      };
    }
  }

  async getImageById(category: string, id: number) {
    try {
      const image = await this.imageRepository.findOne({
        where: { id, category: category as any },
      });

      return image;
    } catch (error) {
      // 数据库连接失败时从模拟数据中查找
      const mockData = this.mockGalleryData[category as keyof typeof this.mockGalleryData] || [];
      return mockData.find((item) => item.id === id) || null;
    }
  }
}