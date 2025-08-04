import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';

@ApiTags('审核管理')
@Controller('review')
@UseGuards(AuthGuard('jwt'))
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
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await this.reviewService.getPendingImages(status, pageNum, limitNum);
    
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
}