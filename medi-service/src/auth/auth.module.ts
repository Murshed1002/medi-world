import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtAuthGuard, RolesGuard, PrismaService],
  exports: [AuthService, OtpService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
