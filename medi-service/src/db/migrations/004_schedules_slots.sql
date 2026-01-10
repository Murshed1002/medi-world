CREATE TABLE doctor_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  doctor_id UUID REFERENCES doctors(id),
  clinic_id UUID REFERENCES clinics(id),

  day_of_week VARCHAR(10) NOT NULL,

  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  slot_duration_minutes INT NOT NULL,

  max_patients_per_slot INT DEFAULT 1
);
