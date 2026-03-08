const pool = require('../config/database');

// Get all packages
const getAllPackages = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM packages 
       WHERE is_available = true 
       ORDER BY display_order, base_price`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get package by ID
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM packages WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new package (admin only)
const createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      duration_nights,
      base_price,
      max_guests,
      includes,
      terms,
      display_order
    } = req.body;

    // Validation
    if (!name || !duration_nights || !base_price || !max_guests) {
      return res.status(400).json({ 
        message: 'Name, duration, price, and max guests are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO packages (name, description, duration_nights, base_price, max_guests, includes, terms, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, duration_nights, base_price, max_guests, includes, terms, display_order || 0]
    );

    res.status(201).json({
      message: 'Package created successfully',
      package: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update package (admin only)
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      duration_nights,
      base_price,
      max_guests,
      includes,
      terms,
      is_available,
      display_order
    } = req.body;

    const result = await pool.query(
      `UPDATE packages 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           duration_nights = COALESCE($3, duration_nights),
           base_price = COALESCE($4, base_price),
           max_guests = COALESCE($5, max_guests),
           includes = COALESCE($6, includes),
           terms = COALESCE($7, terms),
           is_available = COALESCE($8, is_available),
           display_order = COALESCE($9, display_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, description, duration_nights, base_price, max_guests, includes, terms, is_available, display_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({
      message: 'Package updated successfully',
      package: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete package (admin only)
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if package has bookings
    const bookingCheck = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE package_id = $1 AND status NOT IN ($2, $3)',
      [id, 'cancelled', 'completed']
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete package with active bookings' 
      });
    }

    const result = await pool.query(
      'DELETE FROM packages WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
};
