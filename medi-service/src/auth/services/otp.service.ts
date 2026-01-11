import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendOtp(
    phoneNumber: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
    // Check rate limiting - max 3 requests per 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const recentAttempts = await this.prisma.otp_verifications.count({
      where: {
        phone_number: phoneNumber,
        created_at: {
          gte: fifteenMinutesAgo,
        },
      },
    });

    if (recentAttempts >= 3) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again after 15 minutes.',
      );
    }

    // Generate 6-digit OTP
    const otp = this.generateOtp();
    this.logger.log(`Generated OTP for ${phoneNumber}: ${otp}`); // TODO: Remove in production

    // Hash OTP for storage
    const otpHash = await bcrypt.hash(otp, 10);

    // Store OTP with 5 minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otp_verifications.create({
      data: {
        phone_number: phoneNumber,
        otp_hash: otpHash,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });

    // Send OTP via SMS
    await this.sendSms(phoneNumber, otp);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(
    phoneNumber: string,
    otp: string,
  ): Promise<{ valid: boolean; message?: string }> {
    // Get the most recent OTP for this phone number
    const otpRecord = await this.prisma.otp_verifications.findFirst({
      where: {
        phone_number: phoneNumber,
        verified: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!otpRecord) {
      return {
        valid: false,
        message: 'No OTP found. Please request a new one.',
      };
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expires_at) {
      return {
        valid: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check max attempts
    const attempts = otpRecord.attempts ?? 0;
    const maxAttempts = otpRecord.max_attempts ?? 3;
    
    if (attempts >= maxAttempts) {
      return {
        valid: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      };
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    // Increment attempts
    await this.prisma.otp_verifications.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    if (!isValid) {
      const remainingAttempts = maxAttempts - (attempts + 1);
      return {
        valid: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Mark OTP as verified
    await this.prisma.otp_verifications.update({
      where: { id: otpRecord.id },
      data: {
        verified: true,
        verified_at: new Date(),
      },
    });

    return {
      valid: true,
    };
  }

  private generateOtp(): string {
    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
  }

  private async sendSms(phoneNumber: string, otp: string): Promise<void> {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    
    const smsProvider = process.env.SMS_PROVIDER || 'console';

    if (smsProvider === 'console') {
      // Development: Log to console
      this.logger.log(`📱 SMS to ${phoneNumber}: Your OTP is ${otp}. Valid for 5 minutes.`);
      return;
    }

    if (smsProvider === 'twilio') {
      // TODO: Implement Twilio integration
      // const client = twilio(accountSid, authToken);
      // await client.messages.create({
      //   body: `Your OTP is ${otp}. Valid for 5 minutes.`,
      //   to: phoneNumber,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      // });
      this.logger.warn('Twilio SMS not implemented yet');
    }

    if (smsProvider === 'aws-sns') {
      // TODO: Implement AWS SNS integration
      this.logger.warn('AWS SNS not implemented yet');
    }
  }
}
