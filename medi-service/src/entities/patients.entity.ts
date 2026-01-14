import { Entity, PrimaryKey, Property, OneToOne, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AuthUsers } from './auth-users.entity';
import { Appointments } from './appointments.entity';

@Entity({ tableName: 'patients' })
export class Patients {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 100 })
  name!: string;

  @Property({ type: 'date', nullable: true, fieldName: 'date_of_birth' })
  dateOfBirth?: Date;

  @Property({ length: 10, nullable: true })
  gender?: string;

  @Property({ type: 'text', nullable: true })
  address?: string;

  @Property({ length: 15, nullable: true, fieldName: 'phone_number' })
  phoneNumber?: string;

  @Property({ length: 255, nullable: true })
  email?: string;

  @Property({ type: 'text', nullable: true, fieldName: 'medical_history' })
  medicalHistory?: string;

  @Property({ length: 100, nullable: true, fieldName: 'emergency_contact_name' })
  emergencyContactName?: string;

  @Property({ length: 50, nullable: true, fieldName: 'emergency_contact_relation' })
  emergencyContactRelation?: string;

  @Property({ length: 15, nullable: true, fieldName: 'emergency_contact_phone' })
  emergencyContactPhone?: string;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;

  @OneToOne(() => AuthUsers, au => au.patient, { nullable: true, owner: true })
  authUser?: AuthUsers;

  @OneToMany(() => Appointments, a => a.patient)
  appointments = new Collection<Appointments>(this);
}
