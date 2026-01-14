import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000011 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE webhook_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        provider VARCHAR(40) NOT NULL,
        event_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(100),
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE UNIQUE INDEX idx_webhook_events_unique ON webhook_events(provider, event_id);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS webhook_events CASCADE;`);
  }
}
