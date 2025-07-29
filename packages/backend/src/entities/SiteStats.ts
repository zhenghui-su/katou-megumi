import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('site_stats')
export class SiteStats {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'date', unique: true })
	date!: Date;

	@Column({ type: 'int', default: 0, name: 'page_views' })
	pageViews!: number;

	@Column({ type: 'int', default: 0, name: 'unique_visitors' })
	uniqueVisitors!: number;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}