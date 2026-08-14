import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { VatCategoryCode } from 'factur-x-ts';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ comment: 'UN/ECE Rec 20, ex: C62' })
  unit: string;

  @Column('float')
  netPrice: number;

  @Column({ type: 'varchar' })
  vatCategory: VatCategoryCode;

  @Column('float')
  vatRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
