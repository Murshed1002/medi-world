import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000009 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE patients 
      ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50),
      ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(15);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE patients 
      DROP COLUMN IF EXISTS emergency_contact_name,
      DROP COLUMN IF EXISTS emergency_contact_relation,
      DROP COLUMN IF EXISTS emergency_contact_phone;
    `);
  }
}
