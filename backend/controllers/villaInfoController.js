const pool = require('../config/database');

// Get villa information (single villa)
const getVillaInfo = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM villa_info LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Villa information not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching villa info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update villa information (admin only)
const updateVillaInfo = async (req, res) => {
  try {
    const {
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
      house_rules,
      is_available
    } = req.body;

    const result = await pool.query(
      `UPDATE villa_info 
       SET name = COALESCE($1, name),
           tagline = COALESCE($2, tagline),
           description = COALESCE($3, description),
           location = COALESCE($4, location),
           address = COALESCE($5, address),
           max_guests = COALESCE($6, max_guests),
           bedrooms = COALESCE($7, bedrooms),
           bathrooms = COALESCE($8, bathrooms),
           square_meters = COALESCE($9, square_meters),
           amenities = COALESCE($10, amenities),
           features = COALESCE($11, features),
           nearby_attractions = COALESCE($12, nearby_attractions),
           check_in_time = COALESCE($13, check_in_time),
           check_out_time = COALESCE($14, check_out_time),
           cancellation_policy = COALESCE($15, cancellation_policy),
           house_rules = COALESCE($16, house_rules),
           is_available = COALESCE($17, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1
       RETURNING *`,
      [
        name, tagline, description, location, address,
        max_guests, bedrooms, bathrooms, square_meters,
        amenities, features, nearby_attractions,
        check_in_time, check_out_time, cancellation_policy,
        house_rules, is_available
      ]
    );

    res.json({
      message: 'Villa information updated successfully',
      villa: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating villa info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check availability for specific dates
const checkAvailability = async (req, res) => {
  try {
    const { check_in, check_out } = req.query;

    if (!check_in || !check_out) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    // Check if villa is generally available
    const villaResult = await pool.query(
      'SELECT is_available FROM villa_info WHERE id = 1'
    );

    if (!villaResult.rows[0].is_available) {
      return res.json({ available: false, message: 'Villa is currently unavailable' });
    }

    // Check for conflicting bookings
    const bookingResult = await pool.query(
      `SELECT id FROM bookings 
       WHERE status NOT IN ('cancelled', 'rejected')
       AND (
         (check_in <= $1 AND check_out > $1) OR
         (check_in < $2 AND check_out >= $2) OR
         (check_in >= $1 AND check_out <= $2)
       )`,
      [check_in, check_out]
    );

    if (bookingResult.rows.length > 0) {
      return res.json({ 
        available: false, 
        message: 'Villa is already booked for the selected dates' 
      });
    }

    res.json({ 
      available: true, 
      message: 'Villa is available for your selected dates' 
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVillaInfo,
  updateVillaInfo,
  checkAvailability
};
