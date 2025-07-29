import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 50, unique: true })
	username!: string;

	@Column({ type: 'varchar', length: 100, unique: true })
	email!: string;

	@Column({ type: 'varchar', length: 255 })
	password!: string;

	@Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
	role!: 'admin' | 'user';

	@Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
	status!: 'active' | 'inactive';

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date;
}