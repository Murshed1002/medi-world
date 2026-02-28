import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Appointments } from './appointments.entity';
import { DoctorClinics } from './doctor-clinics.entity';

@Entity({ tableName: 'clinics' })
export class Clinics {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 150 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  address?: string;

  @Property({ length: 100, nullable: true })
  city?: string;

  @Property({ length: 100, nullable: true })
  latitude?: string;

  @Property({ length: 100, nullable: true })
  longitude?: string;

  @Property({ length: 15, nullable: true, fieldName: 'phone_number' })
  phoneNumber?: string;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;

  @OneToMany(() => Appointments, a => a.clinic)
  appointments = new Collection<Appointments>(this);

  @OneToMany(() => DoctorClinics, dc => dc.clinic)
  doctorClinics = new Collection<DoctorClinics>(this);
}
