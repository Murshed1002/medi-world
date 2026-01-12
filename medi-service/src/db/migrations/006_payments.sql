CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES patients(id) NOT NULL,

  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(5) DEFAULT 'INR',

  payment_type VARCHAR(40) NOT NULL,
  -- BOOKING_FEE / CONSULTATION_FEE / MEDICINE / DIAGNOSTIC / SUBSCRIPTION

  payment_method VARCHAR(40),
  -- UPI / CARD / NET_BANKING / WALLET
  
  provider VARCHAR(40),
  -- RAZORPAY / STRIPE / PAYTM / PHONEPE

  provider_order_id VARCHAR(255),
  provider_payment_id VARCHAR(255),

  status VARCHAR(30) NOT NULL,
  -- CREATED / PENDING / SUCCESS / FAILED / REFUNDED

  metadata JSONB,
  -- Store additional context like items, delivery address, etc.

  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for appointment payments
CREATE INDEX idx_payments_appt
ON payments(appointment_id);

-- Index for patient payment history
CREATE INDEX idx_payments_patient
ON payments(patient_id, created_at DESC);

-- Index for provider reconciliation
CREATE INDEX idx_payments_provider
ON payments(provider_order_id);

-- Index for status-based queries
CREATE INDEX idx_payments_status
ON payments(status, created_at DESC);
