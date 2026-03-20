import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import '../../components/admin/AdminLayout.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.dashboard.getStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div>📊 Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-error">
          <strong>Error:</strong> {error}
        </div>
        <button onClick={fetchDashboardStats} className="admin-btn admin-btn-primary">
          Try Again
        </button>
      </AdminLayout>
    );
  }

  const { overview, recentBookings, monthlyStats } = stats || {};

  return (
    <AdminLayout>
      {/* Overview Statistics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Bookings</div>
          <div className="admin-stat-value">{overview?.totalBookings || 0}</div>
          <div className="admin-stat-change">
            🔸 {overview?.pendingBookings || 0} pending
          </div>
        </div>

        <div className="admin-stat-card success">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value">
            LKR {(overview?.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="admin-stat-change">
            💰 LKR {(overview?.pendingRevenue || 0).toLocaleString()} pending
          </div>
        </div>

        <div className="admin-stat-card warning">
          <div className="admin-stat-label">Total Users</div>
          <div className="admin-stat-value">{overview?.totalUsers || 0}</div>
          <div className="admin-stat-change">
            ✨ Registered customers
          </div>
        </div>

        <div className="admin-stat-card info">
          <div className="admin-stat-label">Available Packages</div>
          <div className="admin-stat-value">{overview?.totalPackages || 0}</div>
          <div className="admin-stat-change">
            📦 Active packages
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="admin-stats-grid">
        <div className="admin-card">
          <h3>Booking Status</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Confirmed</span>
              <strong>{overview?.confirmedBookings || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Pending</span>
              <strong>{overview?.pendingBookings || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Upcoming (30 days)</span>
              <strong>{overview?.upcomingBookings || 0}</strong>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3>Gallery</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Total Images</span>
              <strong>{overview?.totalImages || 0}</strong>
            </div>
            <Link to="/admin/gallery" className="admin-btn admin-btn-primary admin-btn-small" style={{ marginTop: '15px' }}>
              Manage Gallery
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recent Bookings</h2>
          <Link to="/admin/bookings" className="admin-btn admin-btn-secondary admin-btn-small">
            View All
          </Link>
        </div>

        {recentBookings && recentBookings.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Package</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <div>
                      <strong>{booking.user_name}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{booking.user_email}</small>
                    </div>
                  </td>
                  <td>{booking.package_name || 'Custom'}</td>
                  <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                  <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                  <td>{booking.guests}</td>
                  <td>LKR {booking.total_price.toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
            No recent bookings
          </p>
        )}
      </div>

      {/* Monthly Statistics */}
      {monthlyStats && monthlyStats.length > 0 && (
        <div className="admin-card">
          <h2 className="admin-card-title">Monthly Performance</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((stat, index) => (
                <tr key={index}>
                  <td><strong>{stat.month}</strong></td>
                  <td>{stat.bookings}</td>
                  <td>LKR {parseFloat(stat.revenue || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="admin-card-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
          <Link to="/admin/bookings" className="admin-btn admin-btn-primary">
            📅 Manage Bookings
          </Link>
          <Link to="/admin/users" className="admin-btn admin-btn-primary">
            👥 Manage Users
          </Link>
          <Link to="/admin/packages" className="admin-btn admin-btn-primary">
            📦 Manage Packages
          </Link>
          <Link to="/admin/gallery" className="admin-btn admin-btn-primary">
            🖼️ Manage Gallery
          </Link>
          <Link to="/admin/villa" className="admin-btn admin-btn-primary">
            🏠 Update Villa Info
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

const getStatusColor = (status) => {
  const colors = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger',
    completed: 'info',
  };
  return colors[status] || 'info';
};

export default AdminDashboard;
