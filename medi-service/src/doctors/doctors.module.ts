import { Module } from '@nestjs/common';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module';
import { Doctors } from '../entities/doctors.entity';
import { Appointments } from '../entities/appointments.entity';
import { DoctorSlots } from '../entities/doctor-slots.entity';
import { DoctorClinics } from '../entities/doctor-clinics.entity';
import { Clinics } from 'src/entities/clinics.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Doctors, Appointments, DoctorSlots, DoctorClinics, Clinics]), AuthModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
