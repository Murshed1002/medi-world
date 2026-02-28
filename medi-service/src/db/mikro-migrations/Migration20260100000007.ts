import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000007 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE clinic_queues (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
        queue_date DATE NOT NULL,
        
        current_token_number INT DEFAULT 0,
        last_issued_token_number INT DEFAULT 0,
        
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(clinic_id, doctor_id, queue_date)
      );

      CREATE INDEX idx_clinic_queues_date ON clinic_queues(queue_date);

      CREATE TABLE queue_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        clinic_queue_id UUID REFERENCES clinic_queues(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
        
        token_number INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        
        check_in_time TIMESTAMP,
        call_time TIMESTAMP,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_queue_entries_queue ON queue_entries(clinic_queue_id);
      CREATE INDEX idx_queue_entries_appointment ON queue_entries(appointment_id);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DROP TABLE IF EXISTS queue_entries CASCADE;
      DROP TABLE IF EXISTS clinic_queues CASCADE;
    `);
  }
}
