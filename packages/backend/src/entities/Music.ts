import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('music')
export class Music {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255 })
  artist!: string;

  @Column({ type: 'text' })
  src!: string;

  @Column({ type: 'int', default: 0 })
  duration!: number;

  @Column({ type: 'text', nullable: true })
  cover?: string;

  @Column({ length: 100, default: 'general' })
  category!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}