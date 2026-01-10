CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES patients(id),

  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(5) DEFAULT 'INR',

  payment_type VARCHAR(40),
  -- BOOKING_FEE / CONSULTATION_FEE / MEDICINE / DIAGNOSTIC

  payment_method VARCHAR(40),
  provider VARCHAR(40),

  provider_order_id VARCHAR(255),
  provider_payment_id VARCHAR(255),

  status VARCHAR(30) NOT NULL,
  -- CREATED / SUCCESS / FAILED / REFUNDED

  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_payments_appt
ON payments(appointment_id);

CREATE INDEX idx_payments_provider
ON payments(provider_order_id);
