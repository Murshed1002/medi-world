import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { RedisService } from '../../common/redis/redis.service';
import { AuthUsers } from '../../entities/auth-users.entity';
import { RefreshTokens } from '../../entities/refresh-tokens.entity';
import { Patients } from '../../entities/patients.entity';
import { Doctors } from '../../entities/doctors.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { JwtPayload, AuthTokens, DeviceInfo } from '../types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly ACCESS_TOKEN_TTL = 900; // 15 minutes in seconds

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUsers)
    private readonly authUsersRepo: EntityRepository<AuthUsers>,
    @InjectRepository(RefreshTokens)
    private readonly refreshTokensRepo: EntityRepository<RefreshTokens>,
    @InjectRepository(Patients)
    private readonly patientsRepo: EntityRepository<Patients>,
    @InjectRepository(Doctors)
    private readonly doctorsRepo: EntityRepository<Doctors>,
    private readonly redis: RedisService,
  ) {}

  async authenticateUser(
    phoneNumber: string,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: DeviceInfo,
    role: 'PATIENT' | 'DOCTOR' = 'PATIENT',
  ): Promise<AuthTokens & { user: any }> {
    // Find or create user
    let user = await this.authUsersRepo.findOne(
      { phoneNumber },
      { populate: ['patient', 'doctor'] }
    );

    if (!user) {
      // Create new user with specified role
      user = this.authUsersRepo.create({
        phoneNumber,
        role,
      });
      this.authUsersRepo.getEntityManager().persist(user);
      await this.authUsersRepo.getEntityManager().flush();
      
      // Create role-specific record
      if (role === 'PATIENT') {
        const patient = this.patientsRepo.create({
          authUser: user,
          name: '', // To be updated by user
          phoneNumber,
        });
        this.patientsRepo.getEntityManager().persist(patient);
        await this.patientsRepo.getEntityManager().flush();
        this.logger.log(`New patient created for user: ${user.id}`);
      } else if (role === 'DOCTOR') {
        const doctor = this.doctorsRepo.create({
          authUser: user,
          name: '', // To be updated by user
          phoneNumber,
        });
        this.doctorsRepo.getEntityManager().persist(doctor);
        await this.doctorsRepo.getEntityManager().flush();
        this.logger.log(`New doctor created for user: ${user.id}`);
      }
      
      this.logger.log(`New user created: ${user.id} with role: ${role}`);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      user,
      ipAddress,
      userAgent,
      deviceInfo,
    );

    // Return user data with appropriate role-specific info
    const userData: any = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'PATIENT' && user.patient) {
      userData.patientId = user.patient.id;
      userData.name = user.patient.name;
    } else if (user.role === 'DOCTOR' && user.doctor) {
      userData.doctorId = user.doctor.id;
      userData.name = user.doctor.name;
    }

    return {
      ...tokens,
      user: userData,
    };
  }

  async generateTokens(
    user: any,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: DeviceInfo,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    // Generate access token (15 minutes)
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    } as any);

    // Generate refresh token (30 days)
    const refresh_token = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);

    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    );

    // Store refresh token
    const refreshToken = this.refreshTokensRepo.create({
      user,
      tokenHash: refreshTokenHash,
      expiresAt,
      ipAddress,
      userAgent,
      deviceInfo,
    });
    this.refreshTokensRepo.getEntityManager().persist(refreshToken);
    await this.refreshTokensRepo.getEntityManager().flush();

    return {
      access_token,
      refresh_token,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    // Get all valid tokens
    const tokens = await this.refreshTokensRepo.find({
      revoked: false,
      expiresAt: { $gt: new Date() },
    }, {
      populate: ['user'],
      orderBy: { createdAt: 'desc' },
    });

    // Find matching token
    let matchedToken: RefreshTokens | null = null;
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if user is active
    if (!matchedToken.user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Revoke old refresh token
    matchedToken.revoked = true;
    matchedToken.revokedAt = new Date();
    await this.refreshTokensRepo.getEntityManager().flush();

    // Generate new tokens (refresh token rotation)
    const newTokens = await this.generateTokens(
      matchedToken.user,
      ipAddress,
      userAgent,
    );

    // Link old token to new one
    const newTokenHash = await bcrypt.hash(newTokens.refresh_token, 10);
    const newTokenRecord = await this.refreshTokensRepo.findOne({ tokenHash: newTokenHash });

    if (newTokenRecord) {
      matchedToken.replacedBy = newTokenRecord.id;
      await this.refreshTokensRepo.getEntityManager().flush();
    }

    return newTokens;
  }

  async logout(refreshToken: string, accessToken?: string): Promise<{ success: boolean; phoneNumber?: string }> {
    // Blacklist the access token if provided
    if (accessToken) {
      await this.redis.blacklistToken(accessToken, this.ACCESS_TOKEN_TTL);
      this.logger.log('Access token blacklisted');
    }

    // Find all non-revoked tokens with user information
    const tokens = await this.refreshTokensRepo.find(
      { revoked: false },
      { populate: ['user'] }
    );

    // Find and revoke matching token
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) {
        token.revoked = true;
        token.revokedAt = new Date();
        await this.refreshTokensRepo.getEntityManager().flush();

        // Clear user profile cache
        await this.redis.deleteUserProfile(token.user.id);
        this.logger.log(`User profile cache cleared for ${token.user.id}`);

        return { success: true, phoneNumber: token.user.phoneNumber };
      }
    }

    return { success: true }; // Already logged out or invalid token
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserActiveSessions(userId: string) {
    const sessions = await this.refreshTokensRepo.find({
      user: userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    }, {
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((session) => ({
      sessionId: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceInfo: session.deviceInfo,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.refreshTokensRepo.findOne({
      id: sessionId,
      user: userId,
    });

    if (session) {
      session.revoked = true;
      session.revokedAt = new Date();
      await this.refreshTokensRepo.getEntityManager().flush();
    }
  }
}