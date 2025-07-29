import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('works')
export class Work {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 255 })
	title!: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'enum', enum: ['anime', 'manga', 'game', 'novel'] })
	type!: 'anime' | 'manga' | 'game' | 'novel';

	@Column({ type: 'varchar', length: 500, nullable: true, name: 'thumbnail_url' })
	thumbnailUrl?: string;

	@Column({ type: 'date', nullable: true, name: 'release_date' })
	releaseDate?: Date;

	@Column({ type: 'enum', enum: ['ongoing', 'completed', 'upcoming'], default: 'completed' })
	status!: 'ongoing' | 'completed' | 'upcoming';

	@Column({ type: 'int', default: 0 })
	views!: number;

	@Column({ type: 'int', default: 0 })
	likes!: number;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}