import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000003 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE clinics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(120),
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_clinics_city ON clinics(city);

      CREATE TABLE doctor_clinics (
        doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
        clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
        consultation_fee DECIMAL(10,2),
        booking_fee DECIMAL(10,2),
        PRIMARY KEY (doctor_id, clinic_id)
      );
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DROP TABLE IF EXISTS doctor_clinics CASCADE;
      DROP TABLE IF EXISTS clinics CASCADE;
    `);
  }
}
