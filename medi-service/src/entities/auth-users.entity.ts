import { Entity, PrimaryKey, Property, OneToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Patients } from './patients.entity';
import { Doctors } from './doctors.entity';

@Entity({ tableName: 'auth_users' })
export class AuthUsers {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 15, unique: true, fieldName: 'phone_number' })
  phoneNumber!: string;

  @Property({ length: 255, nullable: true })
  email?: string;

  @Property({ length: 20 })
  role!: string;

  @Property({ default: true, fieldName: 'is_active' })
  isActive?: boolean;

  @Property({ length: 255, nullable: true, fieldName: 'password_hash' })
  passwordHash?: string;

  @Property({ length: 6, nullable: true, fieldName: 'otp_code' })
  otpCode?: string;

  @Property({ nullable: true, fieldName: 'otp_expires_at' })
  otpExpiresAt?: Date;

  @Property({ default: false, fieldName: 'is_verified' })
  isVerified?: boolean;

  @Property({ onCreate: () => new Date(), fieldName: 'created_at' })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date(), fieldName: 'updated_at' })
  updatedAt?: Date;

  // Role-based relationships - only one will be populated based on the 'role' field
  @OneToOne(() => Patients, p => p.authUser, { mappedBy: 'authUser', nullable: true })
  patient?: Patients;

  @OneToOne(() => Doctors, d => d.authUser, { mappedBy: 'authUser', nullable: true })
  doctor?: Doctors;
}
