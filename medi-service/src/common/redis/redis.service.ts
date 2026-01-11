import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisConfig: any = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    // Only add password if provided (not required for local dev)
    const password = this.configService.get('REDIS_PASSWORD');
    if (password) {
      redisConfig.password = password;
    }

    // Only add db if provided (AWS ElastiCache cluster mode doesn't support multiple DBs)
    const db = this.configService.get('REDIS_DB');
    if (db !== undefined && db !== null && db !== '') {
      redisConfig.db = parseInt(db, 10);
    }

    this.client = new Redis(redisConfig);

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  // OTP Operations
  async setOtp(phone: string, otpHash: string, ttlSeconds: number = 300): Promise<void> {
    await this.client.setex(`otp:${phone}`, ttlSeconds, otpHash);
  }

  async getOtp(phone: string): Promise<string | null> {
    return this.client.get(`otp:${phone}`);
  }

  async deleteOtp(phone: string): Promise<void> {
    await this.client.del(`otp:${phone}`);
  }

  // Rate Limiting
  async incrementRateLimit(key: string, ttlSeconds: number): Promise<number> {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, ttlSeconds);
    const results = await multi.exec();
    return results?.[0]?.[1] as number;
  }

  async getRateLimit(key: string): Promise<number> {
    const value = await this.client.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  async deleteRateLimit(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Token Blacklist
  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    await this.client.setex(`blacklist:${token}`, ttlSeconds, 'revoked');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const exists = await this.client.exists(`blacklist:${token}`);
    return exists === 1;
  }

  // User Profile Caching
  async setUserProfile(userId: string, profile: any, ttlSeconds: number = 300): Promise<void> {
    await this.client.setex(`user:profile:${userId}`, ttlSeconds, JSON.stringify(profile));
  }

  async getUserProfile(userId: string): Promise<any | null> {
    const data = await this.client.get(`user:profile:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserProfile(userId: string): Promise<void> {
    await this.client.del(`user:profile:${userId}`);
  }

  // Generic operations
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
