const db = require('../../config/database');

// Get all packages with statistics (admin only)
exports.getAllPackages = async (req, res) => {
  try {
    const query = `
      SELECT p.*,
             COUNT(b.id) as total_bookings,
             SUM(CASE WHEN b.status = 'completed' THEN b.total_price ELSE 0 END) as total_revenue
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      GROUP BY p.id
      ORDER BY p.display_order, p.created_at DESC
    `;

    const result = await db.query(query);
    res.json({ 
      success: true, 
      count: result.rows.length,
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get package by ID with booking statistics (admin only)
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const packageResult = await db.query('SELECT * FROM packages WHERE id = $1', [id]);

    if (packageResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Get package statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(total_price) as total_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings
      WHERE package_id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        package: packageResult.rows[0],
        statistics: statsResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new package (admin only)
exports.createPackage = async (req, res) => {
  try {
    const { name, description, duration_nights, base_price, max_guests, includes, terms, is_available, display_order } = req.body;

    // Validate required fields
    if (!name || !base_price || !max_guests) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, base_price, max_guests' 
      });
    }

    const query = `
      INSERT INTO packages 
      (name, description, duration_nights, base_price, max_guests, includes, terms, is_available, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      name,
      description || null,
      duration_nights || null,
      base_price,
      max_guests,
      includes || [],
      terms || null,
      is_available !== undefined ? is_available : true,
      display_order || 0
    ]);

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update package (admin only)
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_nights, base_price, max_guests, includes, terms, is_available, display_order } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (duration_nights !== undefined) {
      updates.push(`duration_nights = $${paramCount}`);
      values.push(duration_nights);
      paramCount++;
    }

    if (base_price !== undefined) {
      updates.push(`base_price = $${paramCount}`);
      values.push(base_price);
      paramCount++;
    }

    if (max_guests !== undefined) {
      updates.push(`max_guests = $${paramCount}`);
      values.push(max_guests);
      paramCount++;
    }

    if (includes !== undefined) {
      updates.push(`includes = $${paramCount}`);
      values.push(includes);
      paramCount++;
    }

    if (terms !== undefined) {
      updates.push(`terms = $${paramCount}`);
      values.push(terms);
      paramCount++;
    }

    if (is_available !== undefined) {
      updates.push(`is_available = $${paramCount}`);
      values.push(is_available);
      paramCount++;
    }

    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount}`);
      values.push(display_order);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE packages 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete package (admin only)
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if package has active bookings
    const bookingCheck = await db.query(
      "SELECT COUNT(*) as count FROM bookings WHERE package_id = $1 AND status IN ('pending', 'confirmed')",
      [id]
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete package with active bookings. Cancel or complete bookings first.' 
      });
    }

    const result = await db.query('DELETE FROM packages WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({ 
      success: true, 
      message: 'Package deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle package availability (admin only)
exports.togglePackageAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE packages 
       SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({
      success: true,
      message: `Package ${result.rows[0].is_available ? 'enabled' : 'disabled'} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling package availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reorder packages (admin only)
exports.reorderPackages = async (req, res) => {
  try {
    const { package_orders } = req.body; // Array of { id, display_order }

    if (!Array.isArray(package_orders)) {
      return res.status(400).json({ 
        success: false, 
        message: 'package_orders must be an array of {id, display_order}' 
      });
    }

    // Update each package's display order
    for (const item of package_orders) {
      await db.query(
        'UPDATE packages SET display_order = $1 WHERE id = $2',
        [item.display_order, item.id]
      );
    }

    res.json({
      success: true,
      message: 'Packages reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering packages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get package statistics
exports.getPackageStatistics = async (req, res) => {
  try {
    // Total packages
    const totalResult = await db.query('SELECT COUNT(*) as total FROM packages');
    
    // Available packages
    const availableResult = await db.query('SELECT COUNT(*) as count FROM packages WHERE is_available = true');
    
    // Most popular package (by bookings)
    const popularResult = await db.query(`
      SELECT p.id, p.name, COUNT(b.id) as booking_count
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      GROUP BY p.id, p.name
      ORDER BY booking_count DESC
      LIMIT 1
    `);

    // Package revenue breakdown
    const revenueResult = await db.query(`
      SELECT p.name, 
             COUNT(b.id) as bookings,
             SUM(b.total_price) as revenue
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      WHERE b.payment_status = 'paid'
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
    `);

    res.json({
      success: true,
      data: {
        total: parseInt(totalResult.rows[0].total),
        available: parseInt(availableResult.rows[0].count),
        mostPopular: popularResult.rows[0] || null,
        revenueByPackage: revenueResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching package statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
