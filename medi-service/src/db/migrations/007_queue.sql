CREATE TABLE clinic_queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  clinic_id UUID REFERENCES clinics(id),
  doctor_id UUID REFERENCES doctors(id),

  queue_date DATE NOT NULL,

  current_token_number INT DEFAULT 0,
  last_issued_token_number INT DEFAULT 0,

  status VARCHAR(20),
  -- NOT_STARTED / RUNNING / PAUSED / CLOSED

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (clinic_id, doctor_id, queue_date)
);
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  clinic_queue_id UUID REFERENCES clinic_queues(id),
  appointment_id UUID REFERENCES appointments(id),

  token_number INT NOT NULL,

  status VARCHAR(20),
  -- WAITING / SKIPPED / IN_PROGRESS / COMPLETED

  check_in_time TIMESTAMP,
  served_time TIMESTAMP
);
CREATE INDEX idx_queue_entries_queue
ON queue_entries(clinic_queue_id);

CREATE UNIQUE INDEX uniq_token_per_queue
ON queue_entries(clinic_queue_id, token_number);
