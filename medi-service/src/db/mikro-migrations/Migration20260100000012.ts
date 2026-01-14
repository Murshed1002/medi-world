import { Migration } from '@mikro-orm/migrations';

export class Migration20260100000012 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
      ADD COLUMN IF NOT EXISTS supports_video BOOLEAN DEFAULT FALSE;

      CREATE INDEX idx_doctors_rating ON doctors(rating DESC);

      CREATE TABLE doctor_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id UUID,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        helpful_count INT DEFAULT 0 CHECK (helpful_count >= 0),
        is_verified BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_doctor_reviews_doctor ON doctor_reviews(doctor_id);
      CREATE INDEX idx_doctor_reviews_patient ON doctor_reviews(patient_id);
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DROP TABLE IF EXISTS doctor_reviews CASCADE;
      
      ALTER TABLE doctors 
      DROP COLUMN IF EXISTS gender,
      DROP COLUMN IF EXISTS bio,
      DROP COLUMN IF EXISTS rating,
      DROP COLUMN IF EXISTS reviews_count,
      DROP COLUMN IF EXISTS profile_image_url,
      DROP COLUMN IF EXISTS supports_video;
    `);
  }
}
