import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('single')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '单文件上传（需要认证）- 提交审核' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多10个文件
  @ApiBearerAuth()
  @ApiOperation({ summary: '多文件上传（需要认证）- 提交审核' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '公共单文件上传（无需认证）' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async uploadPublicSingle(@UploadedFile() file: Express.Multer.File) {
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

  @Post('public/multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: '公共多文件上传（无需认证）' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async uploadPublicMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const results = [];
    for (const file of files) {
      const result = await this.uploadService.uploadPublicSingleFile(file);
      results.push(result);
    }

    return {
      success: true,
      message: `成功上传${results.length}个文件`,
      data: results,
    };
  }
}