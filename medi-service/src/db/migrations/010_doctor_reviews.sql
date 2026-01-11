-- Create reviews table for doctor reviews
CREATE TABLE doctor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review_text TEXT,
  
  -- Helpfulness tracking
  helpful_count INT DEFAULT 0 CHECK (helpful_count >= 0),
  
  -- Response from doctor
  doctor_response TEXT,
  doctor_response_at TIMESTAMP,
  
  is_verified BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_doctor_reviews_doctor ON doctor_reviews(doctor_id);
CREATE INDEX idx_doctor_reviews_patient ON doctor_reviews(patient_id);
CREATE INDEX idx_doctor_reviews_rating ON doctor_reviews(rating DESC);
CREATE INDEX idx_doctor_reviews_created ON doctor_reviews(created_at DESC);

-- Trigger to update doctor's average rating and review count
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE doctors
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM doctor_reviews
      WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM doctor_reviews
      WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
    )
  WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_doctor_rating
AFTER INSERT OR UPDATE OR DELETE ON doctor_reviews
FOR EACH ROW
EXECUTE FUNCTION update_doctor_rating();

-- Comments
COMMENT ON TABLE doctor_reviews IS 'Patient reviews and ratings for doctors';
COMMENT ON COLUMN doctor_reviews.rating IS 'Rating from 0 to 5 stars';
COMMENT ON COLUMN doctor_reviews.is_verified IS 'Review is from verified appointment';
COMMENT ON COLUMN doctor_reviews.is_anonymous IS 'Patient chose to post anonymously';
COMMENT ON COLUMN doctor_reviews.helpful_count IS 'Number of users who found this review helpful';
