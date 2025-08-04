import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS from 'cos-nodejs-sdk-v5';
import * as path from 'path';

@Injectable()
export class CosService {
  private cos: COS;
  private cosConfig: {
    SecretId: string;
    SecretKey: string;
    Region: string;
    Bucket: string;
    Domain: string;
  };

  constructor(private configService: ConfigService) {
    this.cosConfig = {
      SecretId: this.configService.get<string>('COS_SECRET_ID') || '',
      SecretKey: this.configService.get<string>('COS_SECRET_KEY') || '',
      Region: this.configService.get<string>('COS_REGION') || 'ap-beijing',
      Bucket: this.configService.get<string>('COS_BUCKET') || '',
      Domain: this.configService.get<string>('COS_DOMAIN') || '',
    };

    this.cos = new COS({
      SecretId: this.cosConfig.SecretId,
      SecretKey: this.cosConfig.SecretKey,
    });
  }

  // 检查COS配置是否完整
  isCOSConfigured(): boolean {
    return !!(
      this.cosConfig.SecretId &&
      this.cosConfig.SecretKey &&
      this.cosConfig.Region &&
      this.cosConfig.Bucket
    );
  }

  // 上传文件到COS
  async uploadToCOS(
    file: Buffer,
    fileName: string,
    contentType: string = 'application/octet-stream',
  ): Promise<string> {
    if (!this.isCOSConfigured()) {
      throw new Error('COS配置不完整，请检查环境变量');
    }

    try {
      const result = await this.cos.putObject({
        Bucket: this.cosConfig.Bucket,
        Region: this.cosConfig.Region,
        Key: fileName,
        Body: file,
        ContentType: contentType,
      });

      // 返回文件的访问URL
      return `${this.cosConfig.Domain}/${fileName}`;
    } catch (error) {
      console.error('COS上传失败:', error);
      throw new Error('文件上传失败');
    }
  }

  // 从COS删除文件
  async deleteFromCOS(fileName: string): Promise<void> {
    if (!this.isCOSConfigured()) {
      throw new Error('COS配置不完整，请检查环境变量');
    }

    try {
      await this.cos.deleteObject({
        Bucket: this.cosConfig.Bucket,
        Region: this.cosConfig.Region,
        Key: fileName,
      });
    } catch (error) {
      console.error('COS删除失败:', error);
      throw new Error('文件删除失败');
    }
  }

  // 生成唯一文件名
  generateFileName(
    originalFilename: string,
    category: string = 'uploads',
  ): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    
    // 按分类生成路径
    return `images/${category}/${timestamp}_${randomStr}_${baseName}${ext}`;
  }
}