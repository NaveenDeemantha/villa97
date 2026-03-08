import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages');
      setPackages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load packages');
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setError('');
      setSuccess('');

      await api.post('/bookings', {
        package_id: selectedPackage?.id || null,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests),
        special_requests: specialRequests
      });

      setSuccess('Booking request submitted successfully!');
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading packages...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Stay Packages</h1>
      <p style={styles.subtitle}>
        Choose from our carefully curated packages for your perfect getaway at Villa 97
      </p>

      <div style={styles.packagesGrid}>
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            style={{
              ...styles.packageCard,
              ...(selectedPackage?.id === pkg.id ? styles.packageCardSelected : {})
            }}
            onClick={() => setSelectedPackage(pkg)}
          >
            <h2 style={styles.packageName}>{pkg.name}</h2>
            <div style={styles.packagePrice}>
              LKR {pkg.base_price.toLocaleString()}
            </div>
            <div style={styles.packageDuration}>
              {pkg.duration_nights} Night{pkg.duration_nights > 1 ? 's' : ''}
            </div>
            <p style={styles.packageDescription}>{pkg.description}</p>

            {pkg.includes && pkg.includes.length > 0 && (
              <div style={styles.includesSection}>
                <h4 style={styles.includesTitle} >What's Included:</h4>
                <ul style={styles.includesList}>
                  {pkg.includes.map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.packageFooter}>
              <span style={styles.maxGuests}>Up to {pkg.max_guests} guests</span>
            </div>

            {selectedPackage?.id === pkg.id && (
              <div style={styles.selectedBadge}>Selected</div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.bookingSection}>
        <h2 style={styles.bookingSectionTitle}>Book Your Stay</h2>
        
        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <form onSubmit={handleBooking} style={styles.bookingForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Selected Package:</label>
              <input
                type="text"
                value={selectedPackage ? selectedPackage.name : 'Custom Booking (Choose dates below)'}
                disabled
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Check-in Date *</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Check-out Date *</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Guests *</label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="1"
                max={selectedPackage?.max_guests || 12}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Special Requests</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements? (e.g., dietary restrictions, early check-in)"
              rows="4"
              style={{...styles.input, resize: 'vertical', fontFamily: 'inherit'}}
            />
          </div>

          {!user && (
            <div style={styles.loginNote}>
              Please <a href="/login" style={styles.link}>login</a> to complete your booking
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...((!checkIn || !checkOut || !guests) ? styles.submitButtonDisabled : {})
            }}
            disabled={!checkIn || !checkOut || !guests}
          >
            {user ? 'Book Now' : 'Login to Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  loading: { textAlign: 'center', padding: '100px 20px', fontSize: '1.5rem', color: '#666' },
  title: { fontSize: '2.5rem', textAlign: 'center', marginBottom: '10px', color: '#1a1a1a' },
  subtitle: { fontSize: '1.1rem', textAlign: 'center', color: '#666', marginBottom: '40px' },
  packagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '60px' },
  packageCard: { background: 'white', border: '2px solid #e0e0e0', borderRadius: '15px', padding: '30px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative' },
  packageCardSelected: { borderColor: '#4a90e2', boxShadow: '0 8px 20px rgba(74, 144, 226, 0.3)', transform: 'translateY(-5px)' },
  packageName: { fontSize: '1.8rem', marginBottom: '10px', color: '#1a1a1a' },
  packagePrice: { fontSize: '2rem', fontWeight: 'bold', color: '#4a90e2', marginBottom: '5px' },
  packageDuration: { fontSize: '1rem', color: '#666', marginBottom: '15px' },
  packageDescription: { fontSize: '1rem', lineHeight: '1.6', color: '#555', marginBottom: '20px' },
  includesSection: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' },
  includesTitle: { fontSize: '1.1rem', marginBottom: '10px', color: '#1a1a1a' },
  includesList: { listStyle: 'none', padding: 0, margin: 0 },
  packageFooter: { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' },
  maxGuests: { fontSize: '0.95rem', color: '#666' },
  selectedBadge: { position: 'absolute', top: '15px', right: '15px', background: '#4a90e2', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  bookingSection: { background: '#f8f9fa', padding: '40px', borderRadius: '15px', marginTop: '40px' },
  bookingSectionTitle: { fontSize: '2rem', marginBottom: '30px', textAlign: 'center', color: '#1a1a1a' },
  bookingForm: { maxWidth: '800px', margin: '0 auto' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  loginNote: { textAlign: 'center', padding: '15px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px' },
  link: { color: '#4a90e2', textDecoration: 'none', fontWeight: '600' },
  submitButton: { width: '100%', padding: '15px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.3s' },
  submitButtonDisabled: { background: '#ccc', cursor: 'not-allowed' },
  errorAlert: { background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
  successAlert: { background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
};

export default Packages;
