import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from '../../../mikro-orm.config';

// Import all entities
import { Appointments } from '../../entities/appointments.entity';
import { AuthUsers } from '../../entities/auth-users.entity';
import { Patients } from '../../entities/patients.entity';
import { Doctors } from '../../entities/doctors.entity';
import { Clinics } from '../../entities/clinics.entity';
import { QueueEntries } from '../../entities/queue-entries.entity';
import { DoctorClinics } from '../../entities/doctor-clinics.entity';
import { Payments } from '../../entities/payments.entity';
import { AuditLogs } from '../../entities/audit-logs.entity';
import { WebhookEvents } from '../../entities/webhook-events.entity';
import { RefreshTokens } from '../../entities/refresh-tokens.entity';
import { ClinicQueues } from '../../entities/clinic-queues.entity';
import { DoctorSlots } from '../../entities/doctor-slots.entity';

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    MikroOrmModule.forFeature([
      Appointments,
      AuthUsers,
      Patients,
      Doctors,
      Clinics,
      QueueEntries,
      DoctorClinics,
      Payments,
      AuditLogs,
      WebhookEvents,
      RefreshTokens,
      ClinicQueues,
      DoctorSlots,
    ]),
  ],
  exports: [MikroOrmModule],
})
export class DatabaseModule {}
