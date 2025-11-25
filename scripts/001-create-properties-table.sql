-- Create properties table for storing rental property information
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ms VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  address TEXT,
  price DECIMAL(10, 2) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  size_sqft INTEGER,
  furnished VARCHAR(50) DEFAULT 'unfurnished',
  contact_number VARCHAR(20),
  description TEXT,
  description_ms TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_available ON properties(is_available);
