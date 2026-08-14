import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { FacturXProfile } from '../../facturx/facturx-profile';
import type { FacturXInvoiceJson } from '../invoice-payload.type';

export type InvoiceSource = 'created' | 'parsed';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column({ type: 'varchar', default: 'EN 16931' })
  profile: FacturXProfile;

  @Column({ type: 'enum', enum: ['created', 'parsed'], default: 'created' })
  source: InvoiceSource;

  @Column({ type: 'jsonb' })
  payload: FacturXInvoiceJson;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
