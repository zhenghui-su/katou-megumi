import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 50, unique: true })
	username!: string;

	@Column({ type: 'varchar', length: 100, unique: true })
	email!: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	nickname?: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	avatar?: string;

	@Column({ type: 'varchar', length: 255 })
	password!: string;

	@Column({ type: 'enum', enum: ['admin', 'moderator', 'user'], default: 'user' })
	role!: 'admin' | 'moderator' | 'user';

	@Column({ type: 'enum', enum: ['active', 'inactive', 'banned'], default: 'active' })
	status!: 'active' | 'inactive' | 'banned';

	@Column({ type: 'timestamp', nullable: true, name: 'last_login' })
	lastLogin?: Date;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}