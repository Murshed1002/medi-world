import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Doctors } from './doctors.entity';
import { Patients } from './patients.entity';
import { Clinics } from './clinics.entity';
import { QueueEntries } from './queue-entries.entity';

@Entity({ tableName: 'appointments' })
export class Appointments {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Patients, { nullable: true, fieldName: 'patient_id' })
  patient?: Patients;

  @ManyToOne(() => Doctors, { nullable: true, fieldName: 'doctor_id' })
  doctor?: Doctors;

  @ManyToOne(() => Clinics, { nullable: true, fieldName: 'clinic_id' })
  clinic?: Clinics;

  @Property({ type: 'date', fieldName: 'appointment_date' })
  appointmentDate!: Date;

  @Property({ type: 'time', fieldName: 'slot_start_time' })
  slotStartTime!: string;

  @Property({ type: 'time', fieldName: 'slot_end_time' })
  slotEndTime!: string;

  @Property({ length: 30 })
  status!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true, fieldName: 'booking_fee_amount' })
  bookingFeeAmount?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0, fieldName: 'paid_amount' })
  paidAmount?: number;

  @Property({ nullable: true, fieldName: 'queue_token_number' })
  queueTokenNumber?: number;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;

  @OneToMany(() => QueueEntries, qe => qe.appointment)
  queueEntries = new Collection<QueueEntries>(this);
}
