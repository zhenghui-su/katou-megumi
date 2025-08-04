import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('通知管理')
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // 用户获取自己的通知列表
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户通知列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const userId = req.user.id;
    
    const result = await this.notificationService.getUserNotifications(userId, pageNum, limitNum);
    
    return {
      success: true,
      data: result,
    };
  }

  // 获取未读通知数量
  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取未读通知数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.id;
    const count = await this.notificationService.getUnreadCount(userId);
    
    return {
      success: true,
      data: { count },
    };
  }

  // 标记通知为已读
  @Put(':id/read')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '通知不存在' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const notificationId = parseInt(id);
    const userId = req.user.id;
    
    const success = await this.notificationService.markAsRead(notificationId, userId);
    
    if (!success) {
      return {
        success: false,
        message: '通知不存在或无权限',
      };
    }
    
    return {
      success: true,
      message: '已标记为已读',
    };
  }

  // 标记所有通知为已读
  @Put('read-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记所有通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.id;
    const count = await this.notificationService.markAllAsRead(userId);
    
    return {
      success: true,
      message: `已标记 ${count} 条通知为已读`,
    };
  }

  // 删除通知
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除通知' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '通知不存在' })
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    const notificationId = parseInt(id);
    const userId = req.user.id;
    
    const success = await this.notificationService.deleteNotification(notificationId, userId);
    
    if (!success) {
      return {
        success: false,
        message: '通知不存在或无权限',
      };
    }
    
    return {
      success: true,
      message: '通知已删除',
    };
  }

  // 管理员创建系统通知
  @Post('system')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建系统通知（管理员）' })
  @ApiResponse({ status: 200, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createSystemNotification(
    @Body() body: { title: string; content: string },
    @Request() req: any,
  ) {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return {
        success: false,
        message: '权限不足',
      };
    }
    
    const { title, content } = body;
    const senderId = req.user.id;
    
    const notifications = await this.notificationService.createSystemNotificationForAllUsers(
      title,
      content,
      senderId,
    );
    
    return {
      success: true,
      message: `已向 ${notifications.length} 个用户发送系统通知`,
      data: { count: notifications.length },
    };
  }
}