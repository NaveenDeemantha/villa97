import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import '../../components/admin/AdminLayout.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
  });

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.bookings.getAll(filters);
      setBookings(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Change booking status to "${status}"?`)) return;

    try {
      await adminAPI.bookings.updateStatus(id, status);
      alert('✅ Booking status updated successfully!');
      fetchBookings();
    } catch (err) {
      alert('❌ Failed to update status: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handlePaymentUpdate = async (id, payment_status) => {
    if (!window.confirm(`Change payment status to "${payment_status}"?`)) return;

    try {
      await adminAPI.bookings.updatePayment(id, payment_status);
      alert('✅ Payment status updated successfully!');
      fetchBookings();
    } catch (err) {
      alert('❌ Failed to update payment: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this booking? This action cannot be undone.')) return;

    try {
      await adminAPI.bookings.delete(id);
      alert('✅ Booking deleted successfully!');
      fetchBookings();
    } catch (err) {
      alert('❌ Failed to delete booking: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <AdminLayout>
      {/* Filters */}
      <div className="admin-card">
        <h2 className="admin-card-title">Filter Bookings</h2>
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="admin-select"
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filters.payment_status}
            onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
            className="admin-select"
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>

          <button 
            onClick={() => setFilters({ status: '', payment_status: '' })} 
            className="admin-btn admin-btn-secondary admin-btn-small"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            All Bookings {!loading && `(${bookings.length})`}
          </h2>
          <button onClick={fetchBookings} className="admin-btn admin-btn-secondary admin-btn-small">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">Loading bookings...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : bookings.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No bookings found
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest Info</th>
                  <th>Package</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>#{booking.id}</strong></td>
                    <td>
                      <div>
                        <strong>{booking.user_name}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{booking.user_email}</small>
                        {booking.user_phone && (
                          <>
                            <br />
                            <small style={{ color: '#666' }}>{booking.user_phone}</small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>{booking.package_name || 'Custom Booking'}</td>
                    <td>
                      <div>
                        <strong>In:</strong> {new Date(booking.check_in).toLocaleDateString()}
                        <br />
                        <strong>Out:</strong> {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{booking.guests}</td>
                    <td>
                      <strong>LKR {booking.total_price.toLocaleString()}</strong>
                    </td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                        className={`admin-badge admin-badge-${getStatusColor(booking.status)}`}
                        style={{ border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={booking.payment_status}
                        onChange={(e) => handlePaymentUpdate(booking.id, e.target.value)}
                        className={`admin-badge admin-badge-${getPaymentStatusColor(booking.payment_status)}`}
                        style={{ border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="admin-btn admin-btn-danger admin-btn-small"
                          title="Delete Booking"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

const getPaymentStatusColor = (status) => {
  const colors = {
    paid: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'info',
  };
  return colors[status] || 'info';
};

export default AdminBookings;
