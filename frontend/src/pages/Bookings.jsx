import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';

const Bookings = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      loadBookings();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to cancel booking' 
      });
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'alert-success';
      case 'pending':
        return 'alert-info';
      case 'cancelled':
        return 'alert-error';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div style={{padding: '3rem 0', minHeight: '70vh'}}>
      <div className="container">
        <h1 className="page-title">My Bookings</h1>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {bookings.length === 0 ? (
          <div style={{textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '8px'}}>
            <p style={{fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '2rem'}}>
              You don't have any bookings yet.
            </p>
            <button onClick={() => navigate('/villas')} className="btn btn-primary">
              Browse Villas
            </button>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee'}}>
                  <h3 style={{margin: 0, color: '#2c3e50'}}>{booking.villa_name}</h3>
                  <span className={`alert ${getStatusClass(booking.status)}`} style={{padding: '0.5rem 1rem', marginBottom: 0}}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div style={{display: 'grid', gap: '1rem', marginBottom: '1.5rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600}}>📍 Location:</span>
                    <span>{booking.location || 'N/A'}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600}}>📅 Check-in:</span>
                    <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600}}>📅 Check-out:</span>
                    <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600}}>👥 Guests:</span>
                    <span>{booking.guests}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600}}>💰 Total Price:</span>
                    <span style={{color: '#2ecc71', fontWeight: 'bold', fontSize: '1.1rem'}}>
                      ${booking.total_price}
                    </span>
                  </div>
                </div>

                {booking.status !== 'cancelled' && (
                  <div style={{display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #eee'}}>
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-secondary"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
