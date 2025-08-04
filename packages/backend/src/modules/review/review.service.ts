import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
  async getPendingImages(status: string, page: number, limit: number, category?: string) {
    const offset = (page - 1) * limit;
    
    const whereCondition: any = { status: status as 'pending' | 'approved' | 'rejected' };
    if (category && category !== 'all') {
      whereCondition.category = category as 'official' | 'anime' | 'wallpaper' | 'fanart';
    }
    
    const [images, total] = await this.pendingImageRepository.findAndCount({
      where: whereCondition,
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

  // 批准图片
  async approveImage(id: number) {
    const pendingImage = await this.pendingImageRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!pendingImage) {
      throw new NotFoundException('图片不存在');
    }

    if (pendingImage.status !== 'pending') {
      throw new BadRequestException('图片已经被审核过了');
    }

    // 创建正式图片记录
    const image = this.imageRepository.create({
      title: pendingImage.title,
      description: pendingImage.description,
      url: pendingImage.url,
      category: pendingImage.category,
      tags: pendingImage.tags,
    });

    await this.imageRepository.save(image);

    // 更新待审核图片状态
    pendingImage.status = 'approved';
    await this.pendingImageRepository.save(pendingImage);

    return image;
  }

  // 拒绝图片
  async rejectImage(id: number, reason?: string) {
    const pendingImage = await this.pendingImageRepository.findOne({
      where: { id },
    });

    if (!pendingImage) {
      throw new NotFoundException('图片不存在');
    }

    if (pendingImage.status !== 'pending') {
      throw new BadRequestException('图片已经被审核过了');
    }

    // 更新状态为拒绝
    pendingImage.status = 'rejected';
    pendingImage.rejectReason = reason || '不符合审核标准';
    await this.pendingImageRepository.save(pendingImage);

    // 可选：删除COS上的文件
    if (this.cosService.isCOSConfigured()) {
      try {
        await this.cosService.deleteFromCOS(pendingImage.url);
      } catch (error) {
        console.error('删除COS文件失败:', error);
      }
    }

    return pendingImage;
  }
}