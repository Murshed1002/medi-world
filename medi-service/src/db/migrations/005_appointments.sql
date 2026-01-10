CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES doctors(id),
  clinic_id UUID REFERENCES clinics(id),

  appointment_date DATE NOT NULL,
  slot_start_time TIME NOT NULL,
  slot_end_time TIME NOT NULL,

  status VARCHAR(30) NOT NULL, 
  -- INITIATED / PAYMENT_PENDING / CONFIRMED / CANCELLED / NO_SHOW / COMPLETED

  booking_fee_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,

  queue_token_number INT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX uniq_doctor_slot_active
ON appointments (doctor_id, appointment_date, slot_start_time)
WHERE status IN ('INITIATED','PAYMENT_PENDING','CONFIRMED');

CREATE INDEX idx_appt_doctor_date
ON appointments(doctor_id, appointment_date);

CREATE INDEX idx_appt_patient
ON appointments(patient_id);
