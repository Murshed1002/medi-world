import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OtpService } from '../services/otp.service';
import { AuthService } from '../services/auth.service';
import { SendOtpDto } from '../dto/send-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
  ) {}

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.otpService.sendOtp(
      sendOtpDto.phone,
      ipAddress,
      userAgent,
    );
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { phone, otp } = verifyOtpDto;

    // Verify OTP
    const verification = await this.otpService.verifyOtp(phone, otp);

    if (!verification.valid) {
      return {
        success: false,
        message: verification.message,
      };
    }

    // Authenticate user and generate tokens
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const authResult = await this.authService.authenticateUser(
      phone,
      ipAddress,
      userAgent,
    );

    // Set HTTP-only cookies
    res.cookie('access_token', authResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', authResult.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      success: true,
      message: 'Authentication successful',
      user: authResult.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return {
        success: false,
        message: 'No refresh token provided',
      };
    }

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const tokens = await this.authService.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent,
    );

    // Set new HTTP-only cookies
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      success: true,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    // req.user is set by JwtAuthGuard
    return {
      user: req.user,
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: any) {
    const sessions = await this.authService.getUserActiveSessions(
      req.user.user_id,
    );

    return {
      sessions,
    };
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Req() req: any, @Param('sessionId') sessionId: string) {
    await this.authService.revokeSession(req.user.user_id, sessionId);

    return {
      success: true,
      message: 'Session revoked successfully',
    };
  }
}
