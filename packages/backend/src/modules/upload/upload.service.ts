import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingImage } from '../../entities/PendingImage';
import { User } from '../../entities/User';
import { CosService } from '../../services/cos.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
  ];

  constructor(
    @InjectRepository(PendingImage)
    private pendingImageRepository: Repository<PendingImage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cosService: CosService,
  ) {}

  // 验证文件类型
  private validateFileType(mimetype: string): boolean {
    return this.allowedTypes.includes(mimetype);
  }

  // 单文件上传（需要认证）- 提交审核
  async uploadSingleFile(
    file: Express.Multer.File,
    userId: number,
    category: string = 'fanart',
  ) {
    // 验证文件类型
    if (!this.validateFileType(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型');
    }

    // 只验证图片类型用于审核
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('审核功能仅支持图片文件');
    }

    // 生成唯一文件名
    const fileName = this.cosService.generateFileName(file.originalname, category);

    // 创建临时存储目录
    const tempDir = path.join(process.cwd(), 'temp', 'pending-images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 写入到临时目录
    const tempFilePath = path.join(tempDir, fileName);
    const fileDir = path.dirname(tempFilePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    try {
      fs.writeFileSync(tempFilePath, file.buffer);
    } catch (error) {
      console.error('写入文件失败:', error);
      throw new BadRequestException('文件处理失败');
    }

    // 生成临时访问URL（本地文件服务）
    const tempFileUrl = `http://localhost:3001/temp/pending-images/${fileName}`;

    // 保存到待审核表
    const pendingImage = this.pendingImageRepository.create({
      title: file.originalname,
      url: tempFileUrl,
      category: category as 'official' | 'anime' | 'wallpaper' | 'fanart',
      originalFilename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      userId: userId,
      status: 'pending',
      localPath: tempFilePath,
    });

    await this.pendingImageRepository.save(pendingImage);

    return {
      fileName: fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      status: 'pending',
    };
  }

  // 多文件上传（需要认证）- 提交审核
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    userId: number,
    category: string = 'fanart',
  ) {
    // 验证所有文件类型
    for (const file of files) {
      if (!this.validateFileType(file.mimetype)) {
        throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`);
      }
      // 只验证图片类型用于审核
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('审核功能仅支持图片文件');
      }
    }

    // 创建临时存储目录
    const tempDir = path.join(process.cwd(), 'temp', 'pending-images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uploadResults = [];

    for (const file of files) {
      const fileName = this.cosService.generateFileName(file.originalname, category);
      
      // 写入到临时目录
      const tempFilePath = path.join(tempDir, fileName);
      const fileDir = path.dirname(tempFilePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      try {
        fs.writeFileSync(tempFilePath, file.buffer);
      } catch (error) {
        console.error('写入文件失败:', error);
        throw new BadRequestException(`文件处理失败: ${file.originalname}`);
      }
      
      // 生成临时访问URL（本地文件服务）
      const tempFileUrl = `http://localhost:3001/temp/pending-images/${fileName}`;
      
      // 保存到待审核表
      const pendingImage = this.pendingImageRepository.create({
        title: file.originalname,
        url: tempFileUrl,
        category: category as 'official' | 'anime' | 'wallpaper' | 'fanart',
        originalFilename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId: userId,
        status: 'pending',
        localPath: tempFilePath,
      });

      await this.pendingImageRepository.save(pendingImage);
      
      uploadResults.push({
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        status: 'pending',
      });
    }

    return uploadResults;
  }

  // 公共单文件上传接口（无需认证）
  async uploadPublicSingleFile(file: Express.Multer.File) {
    // 验证文件类型
    if (!this.validateFileType(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型');
    }

    if (!this.cosService.isCOSConfigured()) {
      throw new BadRequestException('COS服务未配置，请联系管理员');
    }

    // 生成唯一文件名
    const fileName = this.cosService.generateFileName(file.originalname);

    // 上传到COS
    const fileUrl = await this.cosService.uploadToCOS(
      file.buffer,
      fileName,
      file.mimetype,
    );

    return {
      url: fileUrl,
      fileName: fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}