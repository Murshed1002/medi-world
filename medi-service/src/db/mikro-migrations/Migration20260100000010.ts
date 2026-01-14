import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000010 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_info JSONB,
        expires_at TIMESTAMP NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,
        revoked_at TIMESTAMP,
        replaced_by UUID REFERENCES refresh_tokens(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
      CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS refresh_tokens CASCADE;`);
  }
}
