import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('notifications')
export class Notification {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 255 })
	title!: string;

	@Column({ type: 'text' })
	content!: string;

	@Column({ type: 'enum', enum: ['system', 'review', 'user'], default: 'system' })
	type!: 'system' | 'review' | 'user';

	@Column({ type: 'boolean', default: false })
	isRead!: boolean;

	@Column({ type: 'json', nullable: true })
	metadata?: any;

	// 接收通知的用户
	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column({ type: 'int', name: 'user_id' })
	userId!: number;

	// 发送通知的管理员（可选）
	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: 'sender_id' })
	sender?: User;

	@Column({ type: 'int', nullable: true, name: 'sender_id' })
	senderId?: number;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}