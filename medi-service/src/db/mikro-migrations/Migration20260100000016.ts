import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000016 extends Migration {
  async up(): Promise<void> {
    // Fix patients table - rename full_name to name and add missing columns
    this.addSql(`
      ALTER TABLE patients 
      RENAME COLUMN full_name TO name;
    `);

    this.addSql(`
      ALTER TABLE patients 
      DROP COLUMN IF EXISTS blood_group,
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS medical_history TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50),
      ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(15),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    // Fix doctors table - rename and add missing columns
    this.addSql(`
      ALTER TABLE doctors 
      RENAME COLUMN full_name TO name;
    `);

    this.addSql(`
      ALTER TABLE doctors 
      DROP COLUMN IF EXISTS registration_number,
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS license_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);
  }

  async down(): Promise<void> {
    // Revert patients table changes
    this.addSql(`
      ALTER TABLE patients 
      RENAME COLUMN name TO full_name;
    `);

    this.addSql(`
      ALTER TABLE patients 
      ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
      DROP COLUMN IF EXISTS phone_number,
      DROP COLUMN IF EXISTS email,
      DROP COLUMN IF EXISTS medical_history,
      DROP COLUMN IF EXISTS emergency_contact_name,
      DROP COLUMN IF EXISTS emergency_contact_relation,
      DROP COLUMN IF EXISTS emergency_contact_phone,
      DROP COLUMN IF EXISTS updated_at;
    `);

    // Revert doctors table changes
    this.addSql(`
      ALTER TABLE doctors 
      RENAME COLUMN name TO full_name;
    `);

    this.addSql(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS registration_number VARCHAR(120),
      DROP COLUMN IF EXISTS phone_number,
      DROP COLUMN IF EXISTS email,
      DROP COLUMN IF EXISTS license_number,
      DROP COLUMN IF EXISTS updated_at;
    `);
  }
}
