import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Doctors } from './doctors.entity';
import { Clinics } from './clinics.entity';

@Entity({ tableName: 'doctor_slots' })
export class DoctorSlots {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Doctors, { fieldName: 'doctor_id' })
  doctor!: Doctors;

  @ManyToOne(() => Clinics, { fieldName: 'clinic_id' })
  clinic!: Clinics;

  @Property({ length: 20, fieldName: 'day_of_week' })
  dayOfWeek!: string;

  @Property({ type: 'string', columnType: 'time', fieldName: 'start_time' })
  startTime!: string;

  @Property({ type: 'string', columnType: 'time', fieldName: 'end_time' })
  endTime!: string;

  @Property({ type: 'integer', fieldName: 'slot_duration_minutes', default: 15 })
  slotDurationMinutes: number = 15;

  @Property({ type: 'boolean', fieldName: 'is_available', default: true })
  isAvailable: boolean = true;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
