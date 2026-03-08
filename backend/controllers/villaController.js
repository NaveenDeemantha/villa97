const db = require('../config/database');

// Get all villas
exports.getAllVillas = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, guests } = req.query;
    
    let query = 'SELECT * FROM villas WHERE is_available = true';
    const params = [];
    let paramCount = 1;

    if (location) {
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND price_per_night >= $${paramCount}`;
      params.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND price_per_night <= $${paramCount}`;
      params.push(maxPrice);
      paramCount++;
    }

    if (guests) {
      query += ` AND max_guests >= $${paramCount}`;
      params.push(guests);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching villas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get villa by ID
exports.getVillaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM villas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching villa:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check availability
exports.checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    const query = `
      SELECT COUNT(*) as booking_count
      FROM bookings
      WHERE villa_id = $1
        AND status != 'cancelled'
        AND (
          (check_in <= $2 AND check_out >= $2) OR
          (check_in <= $3 AND check_out >= $3) OR
          (check_in >= $2 AND check_out <= $3)
        )
    `;

    const result = await db.query(query, [id, checkIn, checkOut]);
    const isAvailable = result.rows[0].booking_count === '0';

    res.json({ success: true, available: isAvailable });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create villa (admin only)
exports.createVilla = async (req, res) => {
  try {
    const { name, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images } = req.body;

    const query = `
      INSERT INTO villas (name, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [name, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating villa:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update villa
exports.updateVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images, is_available } = req.body;

    const query = `
      UPDATE villas
      SET name = $1, description = $2, location = $3, price_per_night = $4, 
          max_guests = $5, bedrooms = $6, bathrooms = $7, amenities = $8, 
          images = $9, is_available = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const result = await db.query(query, [name, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images, is_available, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating villa:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete villa
exports.deleteVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM villas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }

    res.json({ success: true, message: 'Villa deleted successfully' });
  } catch (error) {
    console.error('Error deleting villa:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
