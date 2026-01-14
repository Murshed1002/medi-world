import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000002 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE patients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        auth_user_id UUID UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(10),
        blood_group VARCHAR(5),
        address TEXT,
        city VARCHAR(120),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_patients_auth_user ON patients(auth_user_id);

      CREATE TABLE doctors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        auth_user_id UUID UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        specialization VARCHAR(120),
        registration_number VARCHAR(120),
        experience_years INT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_doctors_specialization ON doctors(specialization);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DROP TABLE IF EXISTS doctors CASCADE;
      DROP TABLE IF EXISTS patients CASCADE;
    `);
  }
}
