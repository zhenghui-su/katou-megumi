import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('videos')
export class Video {
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

	@Column({ type: 'int', nullable: true })
	duration?: number;

	@Column({ type: 'int', default: 0 })
	views!: number;

	@Column({ type: 'int', default: 0 })
	likes!: number;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}