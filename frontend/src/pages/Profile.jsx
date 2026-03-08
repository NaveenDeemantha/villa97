import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{padding: '3rem 0', minHeight: '70vh'}}>
      <div className="container">
        <div style={{maxWidth: '600px', margin: '0 auto', background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginBottom: '2rem', color: '#2c3e50'}}>My Profile</h2>

          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee'}}>
              <span style={{fontWeight: 600, color: '#2c3e50'}}>Name:</span>
              <span style={{color: '#7f8c8d'}}>{user.name}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee'}}>
              <span style={{fontWeight: 600, color: '#2c3e50'}}>Email:</span>
              <span style={{color: '#7f8c8d'}}>{user.email}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee'}}>
              <span style={{fontWeight: 600, color: '#2c3e50'}}>Phone:</span>
              <span style={{color: '#7f8c8d'}}>{user.phone || 'Not provided'}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee'}}>
              <span style={{fontWeight: 600, color: '#2c3e50'}}>Member since:</span>
              <span style={{color: '#7f8c8d'}}>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button onClick={() => navigate('/bookings')} className="btn btn-primary" style={{flex: 1}}>
              View Bookings
            </button>
            <button onClick={logout} className="btn btn-secondary" style={{flex: 1}}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
