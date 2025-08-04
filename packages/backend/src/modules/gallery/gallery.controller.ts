import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';

@ApiTags('画廊')
@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get()
  @ApiOperation({ summary: '获取所有已通过审核的图片' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async getAllImages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await this.galleryService.getAllImages(pageNum, limitNum);
    
    return {
      success: true,
      data: result.images,
      total: result.total,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':category')
  @ApiOperation({ summary: '获取指定分类的图片' })
  @ApiParam({ name: 'category', description: '图片分类', example: 'official' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async getImagesByCategory(
    @Param('category') category: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const validCategories = ['official', 'anime', 'wallpaper', 'fanart'];
    if (!validCategories.includes(category)) {
      throw new NotFoundException('分类不存在');
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await this.galleryService.getImagesByCategory(category, pageNum, limitNum);
    
    return {
      success: true,
      data: {
        category: result.category,
        images: result.images,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get(':category/:id')
  @ApiOperation({ summary: '获取单张图片详情' })
  @ApiParam({ name: 'category', description: '图片分类', example: 'official' })
  @ApiParam({ name: 'id', description: '图片ID', example: 1 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async getImageById(
    @Param('category') category: string,
    @Param('id') id: string,
  ) {
    const validCategories = ['official', 'anime', 'wallpaper', 'fanart'];
    if (!validCategories.includes(category)) {
      throw new NotFoundException('分类不存在');
    }

    const imageId = parseInt(id);
    if (isNaN(imageId)) {
      throw new NotFoundException('无效的图片ID');
    }

    const image = await this.galleryService.getImageById(category, imageId);
    
    if (!image) {
      throw new NotFoundException('图片不存在');
    }

    return {
      success: true,
      data: image,
    };
  }
}