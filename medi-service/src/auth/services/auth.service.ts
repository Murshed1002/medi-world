import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { JwtPayload, AuthTokens, DeviceInfo } from '../types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async authenticateUser(
    phoneNumber: string,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: DeviceInfo,
  ): Promise<AuthTokens & { user: any }> {
    // Find or create user
    let user = await this.prisma.auth_users.findUnique({
      where: { phone_number: phoneNumber },
    });

    if (!user) {
      // Create new user with PATIENT role by default
      user = await this.prisma.auth_users.create({
        data: {
          phone_number: phoneNumber,
          role: 'PATIENT',
        },
      });
      this.logger.log(`New user created: ${user.id}`);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      user,
      ipAddress,
      userAgent,
      deviceInfo,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
      },
    };
  }

  async generateTokens(
    user: any,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: DeviceInfo,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      user_id: user.id,
      phone_number: user.phone_number,
      role: user.role,
    };

    // Generate access token (15 minutes)
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    } as any);

    // Generate refresh token (30 days)
    const refresh_token = crypto.randomBytes(64).toString('hex');
    const refresh_token_hash = await bcrypt.hash(refresh_token, 10);

    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    );

    // Store refresh token
    await this.prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: refresh_token_hash,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: deviceInfo,
      },
    });

    return {
      access_token,
      refresh_token,
      expires_in: 900, // 15 minutes in seconds
    };
  }

  async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    // Get all valid tokens
    const tokens = await this.prisma.refresh_tokens.findMany({
      where: {
        revoked: false,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        auth_users: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Find matching token
    let matchedToken: any = null;
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token_hash);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if user is active
    if (!matchedToken.auth_users.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Revoke old refresh token
    await this.prisma.refresh_tokens.update({
      where: { id: matchedToken.id },
      data: {
        revoked: true,
        revoked_at: new Date(),
      },
    });

    // Generate new tokens (refresh token rotation)
    const newTokens = await this.generateTokens(
      matchedToken.auth_users,
      ipAddress,
      userAgent,
    );

    // Link old token to new one
    const newTokenHash = await bcrypt.hash(newTokens.refresh_token, 10);
    const newTokenRecord = await this.prisma.refresh_tokens.findFirst({
      where: { token_hash: newTokenHash },
    });

    if (newTokenRecord) {
      await this.prisma.refresh_tokens.update({
        where: { id: matchedToken.id },
        data: { replaced_by: newTokenRecord.id },
      });
    }

    return newTokens;
  }

  async logout(refreshToken: string): Promise<{ success: boolean; phoneNumber?: string }> {
    // Find all non-revoked tokens with user information
    const tokens = await this.prisma.refresh_tokens.findMany({
      where: { revoked: false },
      include: {
        auth_users: true,
      },
    });

    // Find and revoke matching token
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token_hash);
      if (isMatch) {
        await this.prisma.refresh_tokens.update({
          where: { id: token.id },
          data: {
            revoked: true,
            revoked_at: new Date(),
          },
        });
        return { success: true, phoneNumber: token.auth_users.phone_number };
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
    const sessions = await this.prisma.refresh_tokens.findMany({
      where: {
        user_id: userId,
        revoked: false,
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        ip_address: true,
        user_agent: true,
        device_info: true,
        created_at: true,
        expires_at: true,
      },
    });

    return sessions.map((session) => ({
      session_id: session.id,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      device_info: session.device_info,
      created_at: session.created_at,
      expires_at: session.expires_at,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.prisma.refresh_tokens.updateMany({
      where: {
        id: sessionId,
        user_id: userId,
      },
      data: {
        revoked: true,
        revoked_at: new Date(),
      },
    });
  }
}
