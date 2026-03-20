import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>🏡 Villa 97</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <span className="icon">📊</span>
            Dashboard
          </Link>

          <Link 
            to="/admin/bookings" 
            className={`admin-nav-link ${isActive('/admin/bookings') ? 'active' : ''}`}
          >
            <span className="icon">📅</span>
            Bookings
          </Link>

          <Link 
            to="/admin/users" 
            className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <span className="icon">👥</span>
            Users
          </Link>

          <Link 
            to="/admin/packages" 
            className={`admin-nav-link ${isActive('/admin/packages') ? 'active' : ''}`}
          >
            <span className="icon">📦</span>
            Packages
          </Link>

          <Link 
            to="/admin/gallery" 
            className={`admin-nav-link ${isActive('/admin/gallery') ? 'active' : ''}`}
          >
            <span className="icon">🖼️</span>
            Gallery
          </Link>

          <Link 
            to="/admin/villa" 
            className={`admin-nav-link ${isActive('/admin/villa') ? 'active' : ''}`}
          >
            <span className="icon">🏠</span>
            Villa Info
          </Link>

          <div className="admin-nav-divider"></div>

          <Link to="/" className="admin-nav-link">
            <span className="icon">🌐</span>
            View Website
          </Link>

          <button onClick={handleLogout} className="admin-nav-link logout-btn">
            <span className="icon">🚪</span>
            Logout
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <p>Logged in as:</p>
          <strong>{user?.name}</strong>
          <small>{user?.email}</small>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        <header className="admin-header">
          <h1>{getPageTitle(location.pathname)}</h1>
          <div className="admin-header-actions">
            <span className="admin-user-badge">
              👤 {user?.name}
            </span>
          </div>
        </header>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};

const getPageTitle = (pathname) => {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/bookings')) return 'Booking Management';
  if (pathname.startsWith('/admin/users')) return 'User Management';
  if (pathname.startsWith('/admin/packages')) return 'Package Management';
  if (pathname.startsWith('/admin/gallery')) return 'Gallery Management';
  if (pathname.startsWith('/admin/villa')) return 'Villa Information';
  return 'Admin Panel';
};

export default AdminLayout;
