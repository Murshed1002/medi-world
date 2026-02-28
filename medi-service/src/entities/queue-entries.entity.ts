import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Appointments } from './appointments.entity';

@Entity({ tableName: 'queue_entries' })
export class QueueEntries {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ type: 'uuid', nullable: true, fieldName: 'clinic_queue_id' })
  clinicQueueId?: string;

  @ManyToOne(() => Appointments, { nullable: true, fieldName: 'appointment_id' })
  appointment?: Appointments;

  @Property({ fieldName: 'token_number' })
  tokenNumber!: number;

  @Property({ length: 30, default: 'waiting' })
  status?: string;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'called_at' })
  calledAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
