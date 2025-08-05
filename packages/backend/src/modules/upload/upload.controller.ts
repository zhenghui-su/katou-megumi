import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { AdminGuard } from '../../guards/admin.guard';

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('single')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '单文件上传（需要管理员权限）- 提交审核' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body('category') category?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const result = await this.uploadService.uploadSingleFile(
      file,
      req.user.id,
      category || 'fanart',
    );

    return {
      success: true,
      message: '文件已提交审核，审核通过后将显示在画廊中',
      data: result,
    };
  }

  @Post('multiple')
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多10个文件
  @ApiBearerAuth()
  @ApiOperation({ summary: '多文件上传（需要管理员权限）- 提交审核' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
    @Body('category') category?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const results = await this.uploadService.uploadMultipleFiles(
      files,
      req.user.id,
      category || 'fanart',
    );

    return {
      success: true,
      message: `成功提交${results.length}个文件审核，审核通过后将显示在画廊中`,
      data: results,
    };
  }

  @Post('public/single')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '公共单文件上传（需要管理员权限）' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async uploadPublicSingle(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const result = await this.uploadService.uploadPublicSingleFile(file);

    return {
      success: true,
      message: '文件上传成功',
      data: result,
    };
  }

  @Post('music')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '音乐文件上传（需要管理员权限）' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async uploadMusic(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body('title') title?: string,
    @Body('artist') artist?: string,
    @Body('category') category?: string,
    @Body('description') description?: string,
    @Body('cover') cover?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的音乐文件');
    }

    // 验证文件类型
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'video/mp4'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的音乐文件格式');
    }

    const result = await this.uploadService.uploadMusicFile(
      file,
      req.user.id,
      {
        title: title || file.originalname,
        artist: artist || 'Unknown Artist',
        category: category || 'general',
        description,
        cover,
      },
    );

    return {
      success: true,
      message: '音乐文件上传成功',
      data: result,
    };
  }

  @Delete('file')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除COS文件（需要管理员权限）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async deleteFile(
    @Query('url') fileUrl: string,
    @Request() req: any,
  ) {
    if (!fileUrl) {
      throw new BadRequestException('请提供要删除的文件URL');
    }

    const result = await this.uploadService.deleteFile(fileUrl, req.user.id);

    return {
      success: true,
      message: '文件删除成功',
      data: result,
    };
  }
}