import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">🏡 Villa 97</Link>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/packages">Packages</Link></li>
          <li><Link to="/gallery">Gallery</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/bookings">My Bookings</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={logout} className="btn btn-secondary">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary">Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
