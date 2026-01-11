-- OTP verification table
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  phone_number VARCHAR(15) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  
  -- Track attempts and rate limiting
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  
  -- Expiry and status
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  -- Metadata
  ip_address VARCHAR(45),

  -- User agent info for security audits / example "Mozilla/5.0 ..."
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX idx_otp_phone_number 
ON otp_verifications(phone_number, created_at DESC);

-- Index for cleanup expired OTPs
CREATE INDEX idx_otp_expires_at 
ON otp_verifications(expires_at);

-- Refresh tokens table (for session management)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  
  -- Token metadata
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  
  -- Device/session info
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSONB,
  
  -- Refresh token rotation
  replaced_by UUID REFERENCES refresh_tokens(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for user's active tokens
CREATE INDEX idx_refresh_tokens_user 
ON refresh_tokens(user_id, revoked, expires_at DESC);

-- Index for token lookup
CREATE INDEX idx_refresh_tokens_hash 
ON refresh_tokens(token_hash) WHERE NOT revoked;

-- Cleanup function for expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps() RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications 
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Cleanup function for expired refresh tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens 
  WHERE expires_at < NOW() - INTERVAL '7 days' AND revoked = TRUE;
END;
$$ LANGUAGE plpgsql;
