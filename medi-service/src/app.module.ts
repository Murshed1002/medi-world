import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppointmentsModule } from './appointments/Appointments.module';
import { PaymentModule } from './payments/payment.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AppointmentsModule,
    PaymentModule,
    AuthModule,
    PatientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
