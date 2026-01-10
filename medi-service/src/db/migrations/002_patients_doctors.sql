CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  auth_user_id UUID UNIQUE
    REFERENCES auth_users(id) ON DELETE CASCADE,

  full_name VARCHAR(255),
  gender VARCHAR(10),
  dob DATE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  auth_user_id UUID UNIQUE
    REFERENCES auth_users(id) ON DELETE CASCADE,

  full_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(120),

  registration_number VARCHAR(120),
  experience_years INT,

  is_verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialization
ON doctors(specialization);
