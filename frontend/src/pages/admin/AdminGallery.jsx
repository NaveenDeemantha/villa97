import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import '../../components/admin/AdminLayout.css';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ category: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'villa',
    is_featured: false,
    display_order: 0,
    image_url: '',
  });

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.gallery.getAll(filters);
      setImages(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image_url || !formData.title) {
      alert('Image URL and Title are required');
      return;
    }

    try {
      await adminAPI.gallery.create(formData);
      alert('✅ Image added to gallery successfully!');
      resetForm();
      fetchImages();
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      category: 'villa',
      is_featured: false,
      display_order: 0,
      image_url: '',
    });
  };

  const handleToggleFeatured = async (id) => {
    try {
      await adminAPI.gallery.toggleFeatured(id);
      alert('✅ Featured status updated!');
      fetchImages();
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleUpdateOrder = async (id, order) => {
    try {
      await adminAPI.gallery.updateOrder(id, parseInt(order));
      fetchImages();
    } catch (err) {
      alert('❌ Failed to update order: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this image?')) return;

    try {
      await adminAPI.gallery.delete(id);
      alert('✅ Image deleted successfully!');
      fetchImages();
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const categories = ['villa', 'room', 'amenities', 'exterior', 'pool', 'garden', 'events', 'food', 'activities', 'nearby'];

  return (
    <AdminLayout>
      {/* Filters */}
      <div className="admin-card">
        <h2 className="admin-card-title">Filter Gallery</h2>
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>

          <button 
            onClick={() => setFilters({ category: '' })} 
            className="admin-btn admin-btn-secondary admin-btn-small"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Gallery Management */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            Gallery Images {!loading && `(${images.length})`}
          </h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="admin-btn admin-btn-primary admin-btn-small"
          >
            {showForm ? '❌ Cancel' : '➕ Add Image'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Add New Image</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <input
                type="text"
                placeholder="Image URL *"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              
              <input
                type="text"
                placeholder="Image Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontFamily: 'inherit' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>

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
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span>Featured Image</span>
                </label>
              </div>

              <button type="submit" className="admin-btn admin-btn-success">
                ✅ Add Image
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="admin-loading">Loading gallery...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : images.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No images found</p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {images.map((img) => (
                <div key={img.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                  <div style={{ position: 'relative', paddingTop: '66.67%', background: '#f5f5f5' }}>
                    <img 
                      src={img.image_url} 
                      alt={img.title}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#999;">Image not found</div>';
                      }}
                    />
                    {img.is_featured && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        background: '#ffc107', 
                        color: '#fff', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{img.title}</h4>
                    {img.description && (
                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>{img.description}</p>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span className="admin-badge admin-badge-info">{img.category}</span>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        Order: 
                        <input 
                          type="number" 
                          value={img.display_order} 
                          onChange={(e) => handleUpdateOrder(img.id, e.target.value)}
                          style={{ width: '50px', marginLeft: '5px', padding: '2px', border: '1px solid #ddd', borderRadius: '3px' }}
                        />
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleToggleFeatured(img.id)}
                        className="admin-btn admin-btn-warning admin-btn-small"
                        style={{ flex: 1, fontSize: '11px' }}
                        title="Toggle Featured"
                      >
                        {img.is_featured ? '⭐ Unfeature' : '⭐ Feature'}
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="admin-btn admin-btn-danger admin-btn-small"
                        title="Delete Image"
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

export default AdminGallery;
