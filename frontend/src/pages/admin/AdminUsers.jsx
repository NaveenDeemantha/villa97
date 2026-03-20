import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import '../../components/admin/AdminLayout.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.users.getAll(filters);
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await adminAPI.users.create(newUser);
      alert('✅ User created successfully!');
      setShowCreateForm(false);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'user' });
      fetchUsers();
    } catch (err){
      alert('❌ Failed to create user: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleRoleChange = async (id, role) => {
    if (!window.confirm(`Change user role to "${role}"?`)) return;

    try {
      await adminAPI.users.changeRole(id, role);
      alert('✅ User role updated successfully!');
      fetchUsers();
    } catch (err) {
      alert('❌ Failed to update role: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this user? This will also delete their bookings.')) return;

    try {
      await adminAPI.users.delete(id);
      alert('✅ User deleted successfully!');
      fetchUsers();
    } catch (err) {
      alert('❌ Failed to delete user: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <AdminLayout>
      {/* Filters */}
      <div className="admin-card">
        <h2 className="admin-card-title">Filter Users</h2>
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', flex: 1, minWidth: '200px' }}
          />
          
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>

          <button 
            onClick={() => setFilters({ role: '', search: '' })} 
            className="admin-btn admin-btn-secondary admin-btn-small"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            All Users {!loading && `(${users.length})`}
          </h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            className="admin-btn admin-btn-primary admin-btn-small"
          >
            {showCreateForm ? '❌ Cancel' : '➕ Create User'}
          </button>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateUser} style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Create New User</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <input
                type="text"
                placeholder="Full Name *"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              <input
                type="email"
                placeholder="Email *"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              <input
                type="password"
                placeholder="Password *"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <button type="submit" className="admin-btn admin-btn-success" style={{ marginTop: '15px' }}>
              ✅ Create User
            </button>
          </form>
        )}

        {loading ? (
          <div className="admin-loading">Loading users...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No users found</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>#{user.id}</strong></td>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`admin-badge admin-badge-${getRoleBadgeColor(user.role)}`}
                        style={{ border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="admin-btn admin-btn-danger admin-btn-small"
                          title="Delete User"
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

const getRoleBadgeColor = (role) => {
  const colors = {
    admin: 'danger',
    staff: 'warning',
    user: 'info',
  };
  return colors[role] || 'info';
};

export default AdminUsers;
