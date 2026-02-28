import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'payments' })
export class Payments {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 50, fieldName: 'reference_type' })
  referenceType!: string;

  @Property({ type: 'uuid', fieldName: 'reference_id' })
  referenceId!: string;

  @Property({ type: 'uuid', fieldName: 'patient_id' })
  patientId!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Property({ length: 10 })
  currency!: string;

  @Property({ length: 50, fieldName: 'payment_type' })
  paymentType!: string;

  @Property({ length: 30 })
  status!: string;

  @Property({ length: 50, nullable: true, fieldName: 'payment_method' })
  paymentMethod?: string;

  @Property({ length: 50, nullable: true })
  provider?: string;

  @Property({ length: 255, nullable: true, fieldName: 'provider_order_id' })
  providerOrderId?: string;

  @Property({ length: 255, nullable: true, fieldName: 'provider_payment_id' })
  providerPaymentId?: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
