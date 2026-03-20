import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import '../../components/admin/AdminLayout.css';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_nights: '',
    base_price: '',
    max_guests: '',
    includes: [],
    terms: '',
    is_available: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.packages.getAll();
      setPackages(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPackage) {
        await adminAPI.packages.update(editingPackage.id, formData);
        alert('✅ Package updated successfully!');
      } else {
        await adminAPI.packages.create(formData);
        alert('✅ Package created successfully!');
      }
      resetForm();
      fetchPackages();
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      duration_nights: pkg.duration_nights || '',
      base_price: pkg.base_price,
      max_guests: pkg.max_guests,
      includes: pkg.includes || [],
      terms: pkg.terms || '',
      is_available: pkg.is_available,
      display_order: pkg.display_order || 0,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      duration_nights: '',
      base_price: '',
      max_guests: '',
      includes: [],
      terms: '',
      is_available: true,
      display_order: 0,
    });
  };

  const handleToggleAvailability = async (id) => {
    try {
      await adminAPI.packages.toggleAvailability(id);
      alert('✅ Package availability updated!');
      fetchPackages();
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure? This will fail if there are active bookings.')) return;

    try {
      await adminAPI.packages.delete(id);
      alert('✅ Package deleted successfully!');
      fetchPackages();
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.message || 'Cannot delete package with active bookings'));
    }
  };

  return (
    <AdminLayout>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            All Packages {!loading && `(${packages.length})`}
          </h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="admin-btn admin-btn-primary admin-btn-small"
          >
            {showForm ? '❌ Cancel' : '➕ Create Package'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>{editingPackage ? 'Edit Package' : 'Create New Package'}</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <input
                type="text"
                placeholder="Package Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontFamily: 'inherit' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <input
                  type="number"
                  placeholder="Duration (nights)"
                  value={formData.duration_nights}
                  onChange={(e) => setFormData({ ...formData, duration_nights: e.target.value })}
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                
                <input
                  type="number"
                  placeholder="Base Price (LKR) *"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                
                <input
                  type="number"
                  placeholder="Max Guests *"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                  required
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />

                <input
                  type="number"
                  placeholder="Display Order"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                  <span>Available for Booking</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="admin-btn admin-btn-success">
                  {editingPackage ? '✅ Update Package' : '✅ Create Package'}
                </button>
                {editingPackage && (
                  <button type="button" onClick={resetForm} className="admin-btn admin-btn-secondary">
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="admin-loading">Loading packages...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : packages.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No packages found</p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gap: '20px' }}>
              {packages.map((pkg) => (
                <div key={pkg.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{pkg.name}</h3>
                      <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{pkg.description}</p>
                      
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {pkg.duration_nights && (
                          <span style={{ fontSize: '13px' }}>
                            📅 <strong>{pkg.duration_nights} nights</strong>
                          </span>
                        )}
                        <span style={{ fontSize: '13px' }}>
                          💰 <strong>LKR {parseFloat(pkg.base_price).toLocaleString()}</strong>
                        </span>
                        <span style={{ fontSize: '13px' }}>
                          👥 <strong>Up to {pkg.max_guests} guests</strong>
                        </span>
                        {pkg.total_bookings !== undefined && (
                          <span style={{ fontSize: '13px' }}>
                            📊 <strong>{pkg.total_bookings} bookings</strong>
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <span className={`admin-badge admin-badge-${pkg.is_available ? 'success' : 'danger'}`}>
                          {pkg.is_available ? '✅ Available' : '❌ Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className="admin-table-actions">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="admin-btn admin-btn-primary admin-btn-small"
                        title="Edit Package"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(pkg.id)}
                        className="admin-btn admin-btn-secondary admin-btn-small"
                        title="Toggle Availability"
                      >
                        {pkg.is_available ? '🚫' : '✅'}
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="admin-btn admin-btn-danger admin-btn-small"
                        title="Delete Package"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPackages;
