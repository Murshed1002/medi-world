import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Clinics } from './clinics.entity';
import { Doctors } from './doctors.entity';

@Entity({ tableName: 'clinic_queues' })
export class ClinicQueues {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Clinics, { fieldName: 'clinic_id' })
  clinic!: Clinics;

  @ManyToOne(() => Doctors, { fieldName: 'doctor_id' })
  doctor!: Doctors;

  @Property({ type: 'date', fieldName: 'queue_date' })
  queueDate!: Date;

  @Property({ length: 50, default: 'NOT_STARTED' })
  status: string = 'NOT_STARTED';

  @Property({ type: 'integer', fieldName: 'current_token_number', default: 0 })
  currentTokenNumber: number = 0;

  @Property({ type: 'integer', fieldName: 'last_issued_token_number', default: 0 })
  lastIssuedTokenNumber: number = 0;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
