const db = require('../../config/database');

// Get dashboard statistics and overview
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total bookings
    const bookingsResult = await db.query('SELECT COUNT(*) as total FROM bookings');
    const totalBookings = parseInt(bookingsResult.rows[0].total);

    // Get pending bookings
    const pendingResult = await db.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    const pendingBookings = parseInt(pendingResult.rows[0].count);

    // Get confirmed bookings
    const confirmedResult = await db.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");
    const confirmedBookings = parseInt(confirmedResult.rows[0].count);

    // Get total users
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);

    // Get total revenue
    const revenueResult = await db.query("SELECT SUM(total_price) as total FROM bookings WHERE payment_status = 'paid'");
    const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

    // Get pending revenue
    const pendingRevenueResult = await db.query("SELECT SUM(total_price) as total FROM bookings WHERE payment_status = 'pending'");
    const pendingRevenue = parseFloat(pendingRevenueResult.rows[0].total) || 0;

    // Get total packages
    const packagesResult = await db.query('SELECT COUNT(*) as total FROM packages');
    const totalPackages = parseInt(packagesResult.rows[0].total);

    // Get total gallery images
    const galleryResult = await db.query('SELECT COUNT(*) as total FROM gallery');
    const totalImages = parseInt(galleryResult.rows[0].total);

    // Get recent bookings (last 5)
    const recentBookingsResult = await db.query(`
      SELECT b.id, b.check_in, b.check_out, b.guests, b.status, b.total_price,
             u.name as user_name, u.email as user_email,
             p.name as package_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN packages p ON b.package_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // Get upcoming bookings (next 30 days)
    const upcomingResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE check_in >= CURRENT_DATE 
      AND check_in <= CURRENT_DATE + INTERVAL '30 days'
      AND status != 'cancelled'
    `);
    const upcomingBookings = parseInt(upcomingResult.rows[0].count);

    // Get booking statistics by month (last 6 months)
    const monthlyStatsResult = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        COUNT(*) as bookings,
        SUM(total_price) as revenue
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
    `);

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          pendingBookings,
          confirmedBookings,
          upcomingBookings,
          totalUsers,
          totalRevenue,
          pendingRevenue,
          totalPackages,
          totalImages
        },
        recentBookings: recentBookingsResult.rows,
        monthlyStats: monthlyStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get booking analytics
exports.getBookingAnalytics = async (req, res) => {
  try {
    // Bookings by status
    const statusResult = await db.query(`
      SELECT status, COUNT(*) as count, SUM(total_price) as revenue
      FROM bookings
      GROUP BY status
    `);

    // Bookings by package
    const packageResult = await db.query(`
      SELECT p.name, COUNT(b.id) as bookings, SUM(b.total_price) as revenue
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      GROUP BY p.id, p.name
      ORDER BY bookings DESC
    `);

    // Average booking value
    const avgResult = await db.query(`
      SELECT AVG(total_price) as avg_value
      FROM bookings
    `);
    const avgBookingValue = parseFloat(avgResult.rows[0].avg_value) || 0;

    // Occupancy rate (last 30 days)
    const occupancyResult = await db.query(`
      SELECT COUNT(DISTINCT check_in) as booked_days
      FROM bookings
      WHERE check_in >= CURRENT_DATE - INTERVAL '30 days'
      AND check_in < CURRENT_DATE
      AND status != 'cancelled'
    `);
    const bookedDays = parseInt(occupancyResult.rows[0].booked_days);
    const occupancyRate = ((bookedDays / 30) * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        byStatus: statusResult.rows,
        byPackage: packageResult.rows,
        avgBookingValue,
        occupancyRate: parseFloat(occupancyRate)
      }
    });
  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'year'

    let interval, format;
    switch (period) {
      case 'week':
        interval = '7 days';
        format = 'Day, DD Mon';
        break;
      case 'year':
        interval = '12 months';
        format = 'Mon YYYY';
        break;
      default:
        interval = '30 days';
        format = 'DD Mon';
    }

    const revenueResult = await db.query(`
      SELECT 
        TO_CHAR(created_at, $1) as period,
        COUNT(*) as bookings,
        SUM(total_price) as revenue,
        SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total_price ELSE 0 END) as pending_revenue
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL $2
      GROUP BY period, DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at) ASC
    `, [format, interval]);

    res.json({
      success: true,
      data: revenueResult.rows
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    // Total users by role
    const roleResult = await db.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    // New users (last 30 days)
    const newUsersResult = await db.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Users with bookings
    const activeUsersResult = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM bookings
    `);

    // Top users by bookings
    const topUsersResult = await db.query(`
      SELECT u.id, u.name, u.email, 
             COUNT(b.id) as total_bookings,
             SUM(b.total_price) as total_spent
      FROM users u
      JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY total_bookings DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        byRole: roleResult.rows,
        newUsers: parseInt(newUsersResult.rows[0].count),
        activeUsers: parseInt(activeUsersResult.rows[0].count),
        topUsers: topUsersResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get system health status
exports.getSystemHealth = async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await db.query('SELECT NOW()');
    const dbStatus = dbCheck.rows.length > 0 ? 'healthy' : 'unhealthy';

    // Get database size
    const dbSizeResult = await db.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);

    // Get table row counts
    const tables = ['users', 'bookings', 'packages', 'gallery', 'villa_info', 'reviews'];
    const tableCounts = {};

    for (const table of tables) {
      const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      tableCounts[table] = parseInt(result.rows[0].count);
    }

    res.json({
      success: true,
      data: {
        database: {
          status: dbStatus,
          size: dbSizeResult.rows[0].size,
          timestamp: dbCheck.rows[0].now
        },
        tables: tableCounts,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: { database: { status: 'unhealthy' } }
    });
  }
};
