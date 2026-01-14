import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000006 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

        appointment_id UUID REFERENCES appointments(id),
        patient_id UUID REFERENCES patients(id) NOT NULL,

        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(5) DEFAULT 'INR',

        payment_type VARCHAR(40) NOT NULL,
        payment_method VARCHAR(40),
        provider VARCHAR(40),

        provider_order_id VARCHAR(255),
        provider_payment_id VARCHAR(255),

        status VARCHAR(30) NOT NULL,
        metadata JSONB,

        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_payments_appt ON payments(appointment_id);
      CREATE INDEX idx_payments_patient ON payments(patient_id, created_at DESC);
      CREATE INDEX idx_payments_provider ON payments(provider_order_id);
      CREATE INDEX idx_payments_status ON payments(status, created_at DESC);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS payments CASCADE;`);
  }
}
