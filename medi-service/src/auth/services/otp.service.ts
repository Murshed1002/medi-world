import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_TTL = 300; // 5 minutes
  private readonly RATE_LIMIT_TTL = 900; // 15 minutes
  private readonly MAX_OTP_REQUESTS = 10;
  private readonly MAX_VERIFY_ATTEMPTS = 3;

  constructor(private readonly redis: RedisService) {}

  async sendOtp(
    phoneNumber: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
    // Check rate limiting using Redis
    const rateLimitKey = `otp:rate:${phoneNumber}`;
    const attempts = await this.redis.getRateLimit(rateLimitKey);

    if (attempts >= this.MAX_OTP_REQUESTS) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again after 15 minutes.',
      );
    }

    // Increment rate limit counter
    await this.redis.incrementRateLimit(rateLimitKey, this.RATE_LIMIT_TTL);

    // Generate 6-digit OTP
    const otp = this.generateOtp();
    this.logger.log(`Generated OTP for ${phoneNumber}: ${otp}`); // TODO: Remove in production

    // Hash OTP for storage
    const otpHash = await bcrypt.hash(otp, 10);

    // Store OTP in Redis with metadata
    const otpData = {
      otpHash,
      attempts: 0,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    };

    await this.redis.set(
      `otp:${phoneNumber}`,
      JSON.stringify(otpData),
      this.OTP_TTL,
    );

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
    // Get OTP from Redis
    const otpDataStr = await this.redis.get(`otp:${phoneNumber}`);

    if (!otpDataStr) {
      return {
        valid: false,
        message: 'No OTP found. Please request a new one.',
      };
    }

    const otpData = JSON.parse(otpDataStr);

    // Check max attempts
    if (otpData.attempts >= this.MAX_VERIFY_ATTEMPTS) {
      await this.redis.deleteOtp(phoneNumber);
      return {
        valid: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      };
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpData.otpHash);

    // Increment attempts
    otpData.attempts += 1;
    const remainingTtl = await this.redis.getClient().ttl(`otp:${phoneNumber}`);
    await this.redis.set(
      `otp:${phoneNumber}`,
      JSON.stringify(otpData),
      remainingTtl > 0 ? remainingTtl : this.OTP_TTL,
    );

    if (!isValid) {
      const remainingAttempts = this.MAX_VERIFY_ATTEMPTS - otpData.attempts;
      return {
        valid: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Delete OTP after successful verification
    await this.redis.deleteOtp(phoneNumber);

    return {
      valid: true,
    };
  }

  private generateOtp(): string {
    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
  }

  async clearOtpVerifications(phoneNumber: string): Promise<void> {
    // Clear OTP and rate limit from Redis
    await this.redis.deleteOtp(phoneNumber);
    await this.redis.deleteRateLimit(`otp:rate:${phoneNumber}`);
    this.logger.log(`Cleared OTP verifications for ${phoneNumber}`);
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
