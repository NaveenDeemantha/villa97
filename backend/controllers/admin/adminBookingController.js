const db = require('../../config/database');

// Get all bookings with filters (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, payment_status, from_date, to_date, user_id } = req.query;

    let query = `
      SELECT b.*, 
             p.name as package_name, 
             p.duration_nights,
             u.name as user_name, 
             u.email as user_email,
             u.phone as user_phone
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Add filters
    if (status) {
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (payment_status) {
      query += ` AND b.payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    if (from_date) {
      query += ` AND b.check_in >= $${paramCount}`;
      params.push(from_date);
      paramCount++;
    }

    if (to_date) {
      query += ` AND b.check_out <= $${paramCount}`;
      params.push(to_date);
      paramCount++;
    }

    if (user_id) {
      query += ` AND b.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    query += ' ORDER BY b.created_at DESC';

    const result = await db.query(query, params);
    res.json({ 
      success: true, 
      count: result.rows.length,
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: pending, confirmed, cancelled, or completed' 
      });
    }

    const query = `
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ 
      success: true, 
      message: 'Booking status updated successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const validStatuses = ['pending', 'paid', 'refunded', 'failed'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment status. Must be: pending, paid, refunded, or failed' 
      });
    }

    const query = `
      UPDATE bookings 
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [payment_status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ 
      success: true, 
      message: 'Payment status updated successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete booking (admin only)
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ 
      success: true, 
      message: 'Booking deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get booking statistics
exports.getBookingStatistics = async (req, res) => {
  try {
    // Get counts by status
    const statusStats = await db.query(`
      SELECT status, COUNT(*) as count
      FROM bookings
      GROUP BY status
    `);

    // Get counts by payment status
    const paymentStats = await db.query(`
      SELECT payment_status, COUNT(*) as count
      FROM bookings
      GROUP BY payment_status
    `);

    // Get upcoming bookings
    const upcoming = await db.query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE check_in > CURRENT_DATE AND status != 'cancelled'
    `);

    // Get current guests (checked in)
    const current = await db.query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE check_in <= CURRENT_DATE 
      AND check_out >= CURRENT_DATE 
      AND status = 'confirmed'
    `);

    res.json({
      success: true,
      data: {
        byStatus: statusStats.rows,
        byPaymentStatus: paymentStats.rows,
        upcomingBookings: parseInt(upcoming.rows[0].count),
        currentGuests: parseInt(current.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create booking on behalf of user (admin only)
exports.createBooking = async (req, res) => {
  try {
    const { user_id, package_id, check_in, check_out, guests, total_price, special_requests, status, payment_status } = req.body;

    // Validate required fields
    if (!user_id || !check_in || !check_out || !guests || !total_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: user_id, check_in, check_out, guests, total_price' 
      });
    }

    // Check if user exists
    const userExists = await db.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check package exists if provided
    if (package_id) {
      const packageExists = await db.query('SELECT id FROM packages WHERE id = $1', [package_id]);
      if (packageExists.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }
    }

    const query = `
      INSERT INTO bookings 
      (user_id, package_id, check_in, check_out, guests, total_price, special_requests, status, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      user_id,
      package_id || null,
      check_in,
      check_out,
      guests,
      total_price,
      special_requests || null,
      status || 'pending',
      payment_status || 'pending'
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update booking details (admin only)
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, guests, total_price, special_requests, status, payment_status } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (check_in !== undefined) {
      updates.push(`check_in = $${paramCount}`);
      values.push(check_in);
      paramCount++;
    }

    if (check_out !== undefined) {
      updates.push(`check_out = $${paramCount}`);
      values.push(check_out);
      paramCount++;
    }

    if (guests !== undefined) {
      updates.push(`guests = $${paramCount}`);
      values.push(guests);
      paramCount++;
    }

    if (total_price !== undefined) {
      updates.push(`total_price = $${paramCount}`);
      values.push(total_price);
      paramCount++;
    }

    if (special_requests !== undefined) {
      updates.push(`special_requests = $${paramCount}`);
      values.push(special_requests);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (payment_status !== undefined) {
      updates.push(`payment_status = $${paramCount}`);
      values.push(payment_status);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE bookings 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
