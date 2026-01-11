-- Add emergency contact fields to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);

-- Add comment
COMMENT ON COLUMN patients.emergency_contact_name IS 'Emergency contact person full name';
COMMENT ON COLUMN patients.emergency_contact_relation IS 'Relationship to patient (e.g., Spouse, Parent, Sibling)';
COMMENT ON COLUMN patients.emergency_contact_phone IS 'Emergency contact phone number';
