-- Migration: Fix payments table to use polymorphic references
-- Description: Change from appointment_id to reference_type/reference_id pattern

-- Add new columns
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS reference_type VARCHAR(40),
ADD COLUMN IF NOT EXISTS reference_id UUID;

-- Migrate existing data: copy appointment_id to reference_id and set type
UPDATE payments 
SET reference_type = 'APPOINTMENT',
    reference_id = appointment_id
WHERE appointment_id IS NOT NULL;

-- Make reference columns required (NOT NULL)
ALTER TABLE payments
ALTER COLUMN reference_type SET NOT NULL,
ALTER COLUMN reference_id SET NOT NULL;

-- Drop old appointment_id column and its index
DROP INDEX IF EXISTS idx_payments_appt;
ALTER TABLE payments DROP COLUMN IF EXISTS appointment_id;

-- Create new index for polymorphic lookups
CREATE INDEX idx_payments_reference 
ON payments(reference_type, reference_id);

-- Drop old foreign key constraint if it exists
-- ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_appointment_id_fkey;
