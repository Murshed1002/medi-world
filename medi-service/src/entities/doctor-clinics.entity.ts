import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Doctors } from './doctors.entity';
import { Clinics } from './clinics.entity';

@Entity({ tableName: 'doctor_clinics' })
export class DoctorClinics {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true, fieldName: 'booking_fee' })
  bookingFee?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true, fieldName: 'consultation_fee' })
  consultationFee?: number;

  @ManyToOne(() => Doctors, { fieldName: 'doctor_id' })
  doctor!: Doctors;

  @ManyToOne(() => Clinics, { fieldName: 'clinic_id' })
  clinic!: Clinics;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;
}
