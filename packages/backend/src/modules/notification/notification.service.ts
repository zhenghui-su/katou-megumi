import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/Notification';
import { User } from '../../entities/User';

@Injectable()
export class NotificationService {
	constructor(
		@InjectRepository(Notification)
		private notificationRepository: Repository<Notification>,
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	// 创建系统通知给所有用户
	async createSystemNotificationForAllUsers(
		title: string,
		content: string,
		senderId?: number
	) {
		const users = await this.userRepository.find({
			where: { role: 'user', status: 'active' },
		});

		const notifications = users.map((user) =>
			this.notificationRepository.create({
				title,
				content,
				type: 'system',
				userId: user.id,
				senderId,
			})
		);

		return await this.notificationRepository.save(notifications);
	}

	// 创建审核通过通知给特定用户
	async createReviewApprovedNotification(userId: number, imageTitle: string) {
		const notification = this.notificationRepository.create({
			title: '图片审核通过',
			content: `您上传的图片「${imageTitle}」已通过审核，现已发布到画廊中。`,
			type: 'review',
			userId,
		});

		return await this.notificationRepository.save(notification);
	}

	// 创建审核拒绝通知给特定用户
	async createReviewRejectedNotification(
		userId: number,
		imageTitle: string,
		reason: string
	) {
		const notification = this.notificationRepository.create({
			title: '图片审核未通过',
			content: `您上传的图片「${imageTitle}」未通过审核。原因：${reason}`,
			type: 'review',
			userId,
		});

		return await this.notificationRepository.save(notification);
	}

	// 获取用户的通知列表
	async getUserNotifications(
		userId: number,
		page: number = 1,
		limit: number = 20
	) {
		const offset = (page - 1) * limit;

		const [notifications, total] =
			await this.notificationRepository.findAndCount({
				where: { userId },
				relations: ['sender'],
				order: { createdAt: 'DESC' },
				take: limit,
				skip: offset,
			});

		return {
			notifications: notifications.map((notification) => ({
				id: notification.id,
				title: notification.title,
				content: notification.content,
				type: notification.type,
				isRead: notification.isRead,
				metadata: notification.metadata,
				sender: notification.sender
					? {
							id: notification.sender.id,
							username: notification.sender.username,
						}
					: null,
				createdAt: notification.createdAt,
			})),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			unreadCount: await this.getUnreadCount(userId),
		};
	}

	// 获取未读通知数量
	async getUnreadCount(userId: number): Promise<number> {
		return await this.notificationRepository.count({
			where: { userId, isRead: false },
		});
	}

	// 标记通知为已读
	async markAsRead(notificationId: number, userId: number) {
		const result = await this.notificationRepository.update(
			{ id: notificationId, userId },
			{ isRead: true }
		);

		return (result.affected || 0) > 0;
	}

	// 标记所有通知为已读
	async markAllAsRead(userId: number) {
		const result = await this.notificationRepository.update(
			{ userId, isRead: false },
			{ isRead: true }
		);

		return result.affected || 0;
	}

	// 删除通知
	async deleteNotification(notificationId: number, userId: number) {
		const result = await this.notificationRepository.delete({
			id: notificationId,
			userId,
		});

		return (result.affected || 0) > 0;
	}
}
