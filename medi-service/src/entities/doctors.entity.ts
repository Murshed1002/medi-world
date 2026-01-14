import { Entity, PrimaryKey, Property, OneToMany, OneToOne, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Appointments } from './appointments.entity';
import { DoctorClinics } from './doctor-clinics.entity';
import { AuthUsers } from './auth-users.entity';

@Entity({ tableName: 'doctors' })
export class Doctors {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 100 })
  name!: string;

  @Property({ length: 10, nullable: true })
  gender?: string;

  @Property({ length: 100, nullable: true })
  specialization?: string;

  @Property({ length: 15, nullable: true, fieldName: 'phone_number' })
  phoneNumber?: string;

  @Property({ length: 255, nullable: true })
  email?: string;

  @Property({ length: 50, nullable: true, fieldName: 'license_number' })
  licenseNumber?: string;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;

  @OneToOne(() => AuthUsers, au => au.doctor, { nullable: true, owner: true })
  authUser?: AuthUsers;

  @OneToMany(() => Appointments, a => a.doctor)
  appointments = new Collection<Appointments>(this);

  @OneToMany(() => DoctorClinics, dc => dc.doctor)
  doctorClinics = new Collection<DoctorClinics>(this);
}
