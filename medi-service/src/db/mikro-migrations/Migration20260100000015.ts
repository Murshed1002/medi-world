import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000015 extends Migration {
  async up(): Promise<void> {
    // Add missing columns to auth_users table
    this.addSql(`
      ALTER TABLE auth_users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    `);

    // Add missing column to refresh_tokens table
    this.addSql(`
      ALTER TABLE refresh_tokens 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);
  }

  async down(): Promise<void> {
    // Remove columns added in up()
    this.addSql(`
      ALTER TABLE auth_users 
      DROP COLUMN IF EXISTS password_hash,
      DROP COLUMN IF EXISTS otp_code,
      DROP COLUMN IF EXISTS otp_expires_at,
      DROP COLUMN IF EXISTS is_verified;
    `);

    this.addSql(`
      ALTER TABLE refresh_tokens 
      DROP COLUMN IF EXISTS updated_at;
    `);
  }
}
