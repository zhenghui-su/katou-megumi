import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('pending_images')
export class PendingImage {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 255 })
	title!: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'varchar', length: 500 })
	url!: string;

	@Column({ type: 'varchar', length: 500, nullable: true, name: 'thumbnail_url' })
	thumbnailUrl?: string;

	@Column({ type: 'enum', enum: ['official', 'anime', 'wallpaper', 'fanart'], default: 'fanart' })
	category!: 'official' | 'anime' | 'wallpaper' | 'fanart';

	@Column({ type: 'json', nullable: true })
	tags?: string[];

	@Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
	status!: 'pending' | 'approved' | 'rejected';

	@Column({ type: 'text', nullable: true, name: 'reject_reason' })
	rejectReason?: string;

	@Column({ type: 'varchar', length: 255, name: 'original_filename' })
	originalFilename!: string;

	@Column({ type: 'int', name: 'file_size' })
	fileSize!: number;

	@Column({ type: 'varchar', length: 100, name: 'mime_type' })
	mimeType!: string;

	@Column({ type: 'varchar', length: 500, nullable: true, name: 'local_path' })
	localPath?: string;

	// 上传用户
	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column({ type: 'int', name: 'user_id' })
	userId!: number;

	// 审核管理员
	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: 'reviewed_by' })
	reviewedBy?: User;

	@Column({ type: 'int', nullable: true, name: 'reviewed_by' })
	reviewedById?: number;

	@Column({ type: 'datetime', nullable: true, name: 'reviewed_at' })
	reviewedAt?: Date;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}