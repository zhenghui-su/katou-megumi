import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingImage } from '../../entities/PendingImage';
import { Image } from '../../entities/Image';
import { CosService } from '../../services/cos.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(PendingImage)
    private pendingImageRepository: Repository<PendingImage>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private cosService: CosService,
  ) {}

  // 获取待审核图片列表
  async getPendingImages(status: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    
    const [images, total] = await this.pendingImageRepository.findAndCount({
      where: { status: status as 'pending' | 'approved' | 'rejected' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      images: images.map((img) => ({
        id: img.id,
        title: img.title,
        description: img.description,
        url: img.url,
        category: img.category,
        originalFilename: img.originalFilename,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        status: img.status,
        rejectReason: img.rejectReason,
        user: {
          id: img.user.id,
          username: img.user.username,
          email: img.user.email,
        },
        createdAt: img.createdAt,
        reviewedAt: img.reviewedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 获取审核统计信息
  async getReviewStats() {
    const [pending, approved, rejected] = await Promise.all([
      this.pendingImageRepository.count({ where: { status: 'pending' } }),
      this.pendingImageRepository.count({ where: { status: 'approved' } }),
      this.pendingImageRepository.count({ where: { status: 'rejected' } }),
    ]);

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }
}