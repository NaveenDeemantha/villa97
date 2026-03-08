-- Create Database
CREATE DATABASE villa97_db;

-- Connect to the database
\c villa97_db;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Villa Info table (Single villa - Villa 97 Bolgoda)
CREATE TABLE villa_info (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  tagline VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  address TEXT,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_meters INTEGER,
  amenities TEXT[],
  features TEXT[],
  nearby_attractions TEXT[],
  check_in_time VARCHAR(20) DEFAULT '2:00 PM',
  check_out_time VARCHAR(20) DEFAULT '11:00 AM',
  cancellation_policy TEXT,
  house_rules TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery table for villa photos
CREATE TABLE gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  image_url TEXT NOT NULL,
  caption TEXT,
  category VARCHAR(50) DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages table (Different stay options)
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duration_nights INTEGER,
  base_price DECIMAL(10, 2) NOT NULL,
  max_guests INTEGER NOT NULL,
  includes TEXT[],
  terms TEXT,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (Updated to reference packages)
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  special_requests TEXT,
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (No villa_id needed - single villa)
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_packages_available ON packages(is_available);

-- Insert Villa 97 Bolgoda information
INSERT INTO villa_info (
  name, 
  tagline, 
  description, 
  location, 
  address,
  max_guests, 
  bedrooms, 
  bathrooms,
  square_meters,
  amenities, 
  features,
  nearby_attractions,
  check_in_time,
  check_out_time,
  cancellation_policy,
  house_rules
) VALUES (
  'Villa 97 Bolgoda',
  'Luxury Lakeside Retreat in Sri Lanka',
  'Experience unparalleled luxury at Villa 97, a stunning lakeside property nestled on the serene shores of Bolgoda Lake. This exquisite villa combines modern amenities with traditional Sri Lankan architecture, offering an unforgettable escape from the everyday. Perfect for families, groups, or romantic getaways, our villa provides the ultimate in comfort, privacy, and natural beauty.',
  'Bolgoda Lake, Sri Lanka',
  'No. 97, Bolgoda Lake Road, Moratuwa, Sri Lanka',
  12,
  5,
  4,
  450,
  ARRAY['Infinity Pool', 'High-Speed WiFi', 'Fully Equipped Kitchen', 'Air Conditioning', 'Lake View', 'Private Parking', 'BBQ Area', 'Boat Dock', 'Garden', 'Outdoor Dining'],
  ARRAY['Waterfront Location', 'Sunset Views', 'Private Beach Access', 'Traditional Sri Lankan Architecture', 'Modern Interior Design', 'Spacious Living Areas', 'Master Suite with Lake View', 'Entertainment System', 'Security System', 'Backup Generator'],
  ARRAY['Colombo City - 20km', 'Mount Lavinia Beach - 10km', 'Dehiwala Zoo - 15km', 'Buddhist Temples', 'Local Markets', 'Water Sports Center'],
  '2:00 PM',
  '11:00 AM',
  'Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before. No refund for cancellations within 3 days of check-in.',
  'No smoking inside the villa. No pets allowed. No parties or events without prior approval. Respect quiet hours (10 PM - 8 AM). Maximum occupancy strictly enforced.'
);

-- Insert sample gallery images
INSERT INTO gallery (title, image_url, caption, category, display_order, is_featured) VALUES
('Main Villa Exterior', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', 'Stunning lakeside view of Villa 97', 'exterior', 1, true),
('Infinity Pool', 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200', 'Infinity pool overlooking Bolgoda Lake', 'pool', 2, true),
('Living Room', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'Spacious living area with modern furnishings', 'interior', 3, true),
('Master Bedroom', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200', 'Luxurious master suite with lake view', 'bedroom', 4, false),
('Dining Area', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'Elegant dining space for family meals', 'interior', 5, false),
('Sunset View', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200', 'Breathtaking sunset over the lake', 'exterior', 6, true),
('Kitchen', 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=1200', 'Fully equipped modern kitchen', 'interior', 7, false),
('Garden', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200', 'Lush tropical garden surroundings', 'exterior', 8, false);

-- Insert stay packages
INSERT INTO packages (name, description, duration_nights, base_price, max_guests, includes, display_order) VALUES
('Weekend Escape',
 'Perfect for a quick getaway. Enjoy two nights of luxury with full access to all villa amenities.',
 2,
 35000.00,
 8,
 ARRAY['2 Nights Accommodation', 'Welcome Drinks', 'Daily Housekeeping', 'WiFi Access', 'Pool & Garden Access', 'BBQ Equipment', 'Boat Dock Access'],
 1
),
('Week-Long Retreat',
 'Immerse yourself in tranquility with a full week at Villa 97. Ideal for families or groups seeking extended relaxation.',
 7,
 110000.00,
 12,
 ARRAY['7 Nights Accommodation', 'Welcome Drinks', 'Daily Housekeeping', 'Mid-week Cleaning', 'WiFi Access', 'Pool & Garden Access', 'BBQ Equipment', 'Boat Dock Access', 'Complimentary Boat Ride', '10% Off on Extended Stay'],
 2
),
('Romantic Honeymoon Package',
 'Celebrate your love in paradise. This special package includes romantic touches for an unforgettable honeymoon experience.',
 3,
 58000.00,
 2,
 ARRAY['3 Nights Accommodation', 'Champagne & Flowers on Arrival', 'Romantic Dinner Setup', 'Couples Massage (2 Hours)', 'Daily Housekeeping', 'WiFi Access', 'Pool & Garden Access', 'Private Sunset Boat Ride', 'Late Checkout (2 PM)'],
 3
),
('Monthly Stay',
 'Long-term luxury living. Perfect for remote workers or extended vacations with significant savings.',
 30,
 400000.00,
 12,
 ARRAY['30 Nights Accommodation', 'Weekly Housekeeping', 'Laundry Service', 'WiFi Access', 'All Amenities Access', 'Dedicated Workspace Setup', 'Bill Payment Assistance', '25% Discount', 'Flexible Check-in/Check-out'],
 4
);
