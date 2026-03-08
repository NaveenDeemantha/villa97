const db = require('../config/database');

// Get all bookings (admin) or user's bookings
exports.getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT b.*, 
             p.name as package_name, 
             p.duration_nights,
             u.name as user_name, 
             u.email as user_email
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
    `;

    // If not admin, only show user's own bookings
    if (userRole !== 'admin') {
      query += ' WHERE b.user_id = $1';
      const result = await db.query(query + ' ORDER BY b.created_at DESC', [userId]);
      return res.json({ success: true, data: result.rows });
    }

    const result = await db.query(query + ' ORDER BY b.created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = `
      SELECT b.*, 
             p.name as package_name, 
             p.description as package_description,
             p.duration_nights,
             p.includes,
             u.name as user_name, 
             u.email as user_email
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user has permission to view this booking
    if (userRole !== 'admin' && result.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { package_id, check_in, check_out, guests, special_requests } = req.body;

    // Validate input
    if (!check_in || !check_out || !guests) {
      return res.status(400).json({ 
        success: false, 
        message: 'Check-in, check-out dates, and number of guests are required' 
      });
    }

    // Check if dates overlap with existing bookings
    const availabilityQuery = `
      SELECT COUNT(*) as booking_count
      FROM bookings
      WHERE status NOT IN ('cancelled', 'rejected')
        AND (
          (check_in <= $1 AND check_out > $1) OR
          (check_in < $2 AND check_out >= $2) OR
          (check_in >= $1 AND check_out <= $2)
        )
    `;

    const availabilityResult = await db.query(availabilityQuery, [check_in, check_out]);

    if (availabilityResult.rows[0].booking_count !== '0') {
      return res.status(400).json({ 
        success: false, 
        message: 'Villa 97 is not available for selected dates' 
      });
    }

    // Get package details if package_id provided
    let total_price = 0;
    if (package_id) {
      const packageResult = await db.query(
        'SELECT base_price, max_guests FROM packages WHERE id = $1 AND is_available = true', 
        [package_id]
      );
      
      if (packageResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Package not found or unavailable' });
      }

      if (guests > packageResult.rows[0].max_guests) {
        return res.status(400).json({ 
          success: false, 
          message: `This package supports maximum ${packageResult.rows[0].max_guests} guests` 
        });
      }

      total_price = packageResult.rows[0].base_price;
    } else {
      // Calculate custom booking price (if no package selected)
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const pricePerNight = 15000; // Base price per night in LKR
      total_price = nights * pricePerNight;
    }

    //Create booking
    const insertQuery = `
      INSERT INTO bookings (user_id, package_id, check_in, check_out, guests, total_price, special_requests, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      userId, 
      package_id || null, 
      check_in, 
      check_out, 
      guests, 
      total_price, 
      special_requests
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

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, special_requests, payment_status } = req.body;

    // Get booking
    const bookingResult = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permission
    if (userRole !== 'admin' && bookingResult.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const query = `
      UPDATE bookings
      SET status = COALESCE($1, status),
          special_requests = COALESCE($2, special_requests),
          payment_status = COALESCE($3, payment_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await db.query(query, [status, special_requests, payment_status, id]);
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

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get booking
    const bookingResult = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permission
    if (userRole !== 'admin' && bookingResult.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const query = `
      UPDATE bookings
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id]);
    res.json({ success: true, message: 'Booking cancelled successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.id;
    const userRole = req.user.role;

    // Check permission
    if (userRole !== 'admin' && requestUserId !== parseInt(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const query = `
      SELECT b.*, 
             p.name as package_name, 
             p.duration_nights,
             p.base_price
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
