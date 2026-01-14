import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RedisModule } from '../common/redis/redis.module';
import { AuthUsers } from '../entities/auth-users.entity';
import { RefreshTokens } from '../entities/refresh-tokens.entity';
import { Patients } from '../entities/patients.entity';
import { Doctors } from '../entities/doctors.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([AuthUsers, RefreshTokens, Patients, Doctors]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' as any,
      },
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, OtpService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
