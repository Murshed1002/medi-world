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

  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INT DEFAULT 0 CHECK (reviews_count >= 0),
  profile_image_url TEXT,
  gender VARCHAR(10),
  supports_video BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_rating ON doctors(rating DESC);
CREATE INDEX idx_doctors_gender ON doctors(gender);
CREATE INDEX idx_doctors_supports_video ON doctors(supports_video);

COMMENT ON COLUMN doctors.bio IS 'Doctor biography and qualifications';
COMMENT ON COLUMN doctors.rating IS 'Average rating from patient reviews (0-5)';
COMMENT ON COLUMN doctors.reviews_count IS 'Total number of reviews';
COMMENT ON COLUMN doctors.profile_image_url IS 'URL to doctor profile image';
COMMENT ON COLUMN doctors.gender IS 'Doctor gender (MALE, FEMALE, OTHER)';
COMMENT ON COLUMN doctors.supports_video IS 'Whether doctor offers video consultations';
