import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000001 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE auth_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(255),
        role VARCHAR(30) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        password_hash VARCHAR(255),
        otp_code VARCHAR(6),
        otp_expires_at TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_auth_users_phone ON auth_users(phone_number);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS auth_users CASCADE;`);
  }
}
