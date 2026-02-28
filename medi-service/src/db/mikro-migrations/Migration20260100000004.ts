import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000004 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE doctor_slots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
        clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        slot_duration_minutes INT NOT NULL,
        max_patients_per_slot INT DEFAULT 1
      );

      CREATE INDEX idx_doctor_slots_doctor_clinic ON doctor_slots(doctor_id, clinic_id);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS doctor_slots CASCADE;`);
  }
}
