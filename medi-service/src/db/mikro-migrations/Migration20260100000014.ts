import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000014 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

      UPDATE payments 
      SET updated_at = created_at
      WHERE updated_at IS NULL;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE payments 
      DROP COLUMN IF EXISTS updated_at;
    `);
  }
}
