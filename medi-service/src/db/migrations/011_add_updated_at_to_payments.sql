-- Migration: Add updated_at column to payments table
-- Description: Add timestamp tracking for payment updates

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update existing records to have updated_at = created_at
UPDATE payments 
SET updated_at = created_at
WHERE updated_at IS NULL;
