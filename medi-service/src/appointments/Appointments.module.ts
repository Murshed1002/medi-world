import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module';
import { Appointments } from '../entities/appointments.entity';
import { Patients } from '../entities/patients.entity';
import { DoctorClinics } from '../entities/doctor-clinics.entity';
import { ClinicQueues } from '../entities/clinic-queues.entity';
import { QueueEntries } from '../entities/queue-entries.entity';
import { Payments } from '../entities/payments.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Appointments,
      Patients,
      DoctorClinics,
      ClinicQueues,
      QueueEntries,
      Payments,
    ]),
    AuthModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}