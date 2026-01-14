import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000013 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS reference_type VARCHAR(40),
      ADD COLUMN IF NOT EXISTS reference_id UUID;

      UPDATE payments 
      SET reference_type = 'APPOINTMENT',
          reference_id = appointment_id
      WHERE appointment_id IS NOT NULL;

      ALTER TABLE payments
      ALTER COLUMN reference_type SET NOT NULL,
      ALTER COLUMN reference_id SET NOT NULL;

      DROP INDEX IF EXISTS idx_payments_appt;
      ALTER TABLE payments DROP COLUMN IF EXISTS appointment_id;

      CREATE INDEX idx_payments_reference 
      ON payments(reference_type, reference_id);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS appointment_id UUID;

      UPDATE payments 
      SET appointment_id = reference_id
      WHERE reference_type = 'APPOINTMENT';

      ALTER TABLE payments 
      DROP COLUMN IF EXISTS reference_type,
      DROP COLUMN IF EXISTS reference_id;

      CREATE INDEX idx_payments_appt ON payments(appointment_id);
    `);
  }
}
