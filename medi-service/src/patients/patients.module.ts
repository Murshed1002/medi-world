import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Patients } from '../entities/patients.entity';
import { AuthUsers } from '../entities/auth-users.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Patients, AuthUsers])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
