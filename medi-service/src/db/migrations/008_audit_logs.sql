CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  entity_type VARCHAR(50),
  entity_id UUID,

  action VARCHAR(50),
  performed_by UUID,

  meta JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);
