import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('images')
export class Image {
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

	@Column({ type: 'enum', enum: ['official', 'anime', 'wallpaper', 'fanart'] })
	category!: 'official' | 'anime' | 'wallpaper' | 'fanart';

	@Column({ type: 'json', nullable: true })
	tags?: string[];

	@Column({ type: 'int', default: 0 })
	views!: number;

	@Column({ type: 'int', default: 0 })
	likes!: number;

	@Column({ type: 'varchar', length: 100, nullable: true, name: 'uploaded_by' })
	uploadedBy?: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}