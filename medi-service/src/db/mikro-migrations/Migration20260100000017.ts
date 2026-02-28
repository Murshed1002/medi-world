import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000017 extends Migration {
  async up(): Promise<void> {
    // Fix clinics table - remove unused columns and add missing ones
    this.addSql(`
      ALTER TABLE clinics
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    // Fix doctor_clinics table - drop composite PK and add id column
    this.addSql(`
      ALTER TABLE doctor_clinics 
      DROP CONSTRAINT doctor_clinics_pkey;
    `);

    this.addSql(`
      ALTER TABLE doctor_clinics 
      ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);

    // Add unique constraint for doctor_id and clinic_id combination
    this.addSql(`
      ALTER TABLE doctor_clinics 
      ADD CONSTRAINT doctor_clinics_doctor_clinic_unique UNIQUE (doctor_id, clinic_id);
    `);
  }

  async down(): Promise<void> {
    // Revert clinics table changes
    this.addSql(`
      ALTER TABLE clinics
      DROP COLUMN IF EXISTS phone_number,
      DROP COLUMN IF EXISTS updated_at;
    `);

    // Revert doctor_clinics table changes
    this.addSql(`
      ALTER TABLE doctor_clinics 
      DROP CONSTRAINT IF EXISTS doctor_clinics_doctor_clinic_unique;
    `);

    this.addSql(`
      ALTER TABLE doctor_clinics 
      DROP COLUMN IF EXISTS id,
      DROP COLUMN IF EXISTS created_at;
    `);

    this.addSql(`
      ALTER TABLE doctor_clinics 
      ADD PRIMARY KEY (doctor_id, clinic_id);
    `);
  }
}
