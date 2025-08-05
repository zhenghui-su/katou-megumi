import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { AdminGuard } from '../../guards/admin.guard';

@ApiTags('审核管理')
@Controller('review')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('pending')
  @ApiOperation({ summary: '获取待审核图片列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getPendingImages(
    @Query('status') status: string = 'pending',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('category') category?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await this.reviewService.getPendingImages(status, pageNum, limitNum, category);
    
    return {
      success: true,
      data: result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取审核统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getReviewStats() {
    const result = await this.reviewService.getReviewStats();
    
    return {
      success: true,
      data: result,
    };
  }

  @Post('approve/:id')
  @ApiOperation({ summary: '批准图片' })
  @ApiResponse({ status: 200, description: '批准成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async approveImage(@Param('id') id: string) {
    const result = await this.reviewService.approveImage(parseInt(id));
    
    return {
      success: true,
      message: '图片已批准',
      data: result,
    };
  }

  @Post('reject/:id')
  @ApiOperation({ summary: '拒绝图片' })
  @ApiResponse({ status: 200, description: '拒绝成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async rejectImage(@Param('id') id: string) {
    const result = await this.reviewService.rejectImage(parseInt(id));
    
    return {
      success: true,
      message: '图片已拒绝',
      data: result,
    };
  }
}