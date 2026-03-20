const db = require('../../config/database');

// Get villa info (admin only)
exports.getVillaInfo = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM villa_info LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa information not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching villa info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update villa info (admin only)
exports.updateVillaInfo = async (req, res) => {
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

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (tagline !== undefined) {
      updates.push(`tagline = $${paramCount}`);
      values.push(tagline);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(location);
      paramCount++;
    }

    if (address !== undefined) {
      updates.push(`address = $${paramCount}`);
      values.push(address);
      paramCount++;
    }

    if (max_guests !== undefined) {
      updates.push(`max_guests = $${paramCount}`);
      values.push(max_guests);
      paramCount++;
    }

    if (bedrooms !== undefined) {
      updates.push(`bedrooms = $${paramCount}`);
      values.push(bedrooms);
      paramCount++;
    }

    if (bathrooms !== undefined) {
      updates.push(`bathrooms = $${paramCount}`);
      values.push(bathrooms);
      paramCount++;
    }

    if (square_meters !== undefined) {
      updates.push(`square_meters = $${paramCount}`);
      values.push(square_meters);
      paramCount++;
    }

    if (amenities !== undefined) {
      updates.push(`amenities = $${paramCount}`);
      values.push(amenities);
      paramCount++;
    }

    if (features !== undefined) {
      updates.push(`features = $${paramCount}`);
      values.push(features);
      paramCount++;
    }

    if (nearby_attractions !== undefined) {
      updates.push(`nearby_attractions = $${paramCount}`);
      values.push(nearby_attractions);
      paramCount++;
    }

    if (check_in_time !== undefined) {
      updates.push(`check_in_time = $${paramCount}`);
      values.push(check_in_time);
      paramCount++;
    }

    if (check_out_time !== undefined) {
      updates.push(`check_out_time = $${paramCount}`);
      values.push(check_out_time);
      paramCount++;
    }

    if (cancellation_policy !== undefined) {
      updates.push(`cancellation_policy = $${paramCount}`);
      values.push(cancellation_policy);
      paramCount++;
    }

    if (house_rules !== undefined) {
      updates.push(`house_rules = $${paramCount}`);
      values.push(house_rules);
      paramCount++;
    }

    if (is_available !== undefined) {
      updates.push(`is_available = $${paramCount}`);
      values.push(is_available);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Update the first (and only) villa record
    const query = `
      UPDATE villa_info 
      SET ${updates.join(', ')}
      WHERE id = (SELECT id FROM villa_info LIMIT 1)
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa information not found' });
    }

    res.json({
      success: true,
      message: 'Villa information updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating villa info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle villa availability (admin only)
exports.toggleAvailability = async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE villa_info 
      SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM villa_info LIMIT 1)
      RETURNING *
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa information not found' });
    }

    res.json({
      success: true,
      message: `Villa ${result.rows[0].is_available ? 'enabled' : 'disabled'} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling villa availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add amenity to villa (admin only)
exports.addAmenity = async (req, res) => {
  try {
    const { amenity } = req.body;

    if (!amenity) {
      return res.status(400).json({ success: false, message: 'Amenity is required' });
    }

    const result = await db.query(`
      UPDATE villa_info 
      SET amenities = array_append(amenities, $1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM villa_info LIMIT 1)
      RETURNING *
    `, [amenity]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa information not found' });
    }

    res.json({
      success: true,
      message: 'Amenity added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding amenity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove amenity from villa (admin only)
exports.removeAmenity = async (req, res) => {
  try {
    const { amenity } = req.body;

    if (!amenity) {
      return res.status(400).json({ success: false, message: 'Amenity is required' });
    }

    const result = await db.query(`
      UPDATE villa_info 
      SET amenities = array_remove(amenities, $1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM villa_info LIMIT 1)
      RETURNING *
    `, [amenity]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa information not found' });
    }

    res.json({
      success: true,
      message: 'Amenity removed successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error removing amenity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add feature to villa (admin only)
exports.addFeature = async (req, res) => {
  try {
    const { feature } = req.body;

    if (!feature) {
      return res.status(400).json({ success: false, message: 'Feature is required' });
    }

    const result = await db.query(`
      UPDATE villa_info 
      SET features = array_append(features, $1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM villa_info LIMIT 1)
      RETURNING *
    `, [feature]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa information not found' });
    }

    res.json({
      success: true,
      message: 'Feature added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding feature:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove feature from villa (admin only)
exports.removeFeature = async (req, res) => {
  try {
    const { feature } = req.body;

    if (!feature) {
      return res.status(400).json({ success: false, message: 'Feature is required' });
    }

    const result = await db.query(`
      UPDATE villa_info 
      SET features = array_remove(features, $1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM villa_info LIMIT 1)
      RETURNING *
    `, [feature]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Villa information not found' });
    }

    res.json({
      success: true,
      message: 'Feature removed successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error removing feature:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get villa statistics (admin only)
exports.getVillaStatistics = async (req, res) => {
  try {
    // Get total bookings for the villa
    const bookingsResult = await db.query('SELECT COUNT(*) as total FROM bookings');
    
    // Get current occupancy
    const occupancyResult = await db.query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE check_in <= CURRENT_DATE 
      AND check_out >= CURRENT_DATE 
      AND status = 'confirmed'
    `);

    // Get upcoming bookings (next 30 days)
    const upcomingResult = await db.query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE check_in > CURRENT_DATE 
      AND check_in <= CURRENT_DATE + INTERVAL '30 days'
      AND status IN ('pending', 'confirmed')
    `);

    // Get occupancy rate (last 90 days)
    const occupancyRateResult = await db.query(`
      SELECT COUNT(DISTINCT check_in) as booked_days
      FROM bookings
      WHERE check_in >= CURRENT_DATE - INTERVAL '90 days'
      AND check_in < CURRENT_DATE + INTERVAL '90 days'
      AND status != 'cancelled'
    `);
    
    const bookedDays = parseInt(occupancyRateResult.rows[0].booked_days);
    const occupancyRate = ((bookedDays / 180) * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        totalBookings: parseInt(bookingsResult.rows[0].total),
        currentOccupancy: parseInt(occupancyResult.rows[0].count),
        upcomingBookings: parseInt(upcomingResult.rows[0].count),
        occupancyRate: parseFloat(occupancyRate)
      }
    });
  } catch (error) {
    console.error('Error fetching villa statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
