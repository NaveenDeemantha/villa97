import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import '../../components/admin/AdminLayout.css';

const AdminVilla = () => {
  const [villaInfo, setVillaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    villa_name: '',
    description: '',
    location_address: '',
    location_city: '',
    location_country: '',
    location_map_url: '',
    bedrooms: '',
    bathrooms: '',
    max_capacity: '',
    area_sqft: '',
    contact_phone: '',
    contact_email: '',
    contact_whatsapp: '',
    check_in_time: '',
    check_out_time: '',
    cancellation_policy: '',
    house_rules: '',
    amenities: [],
    nearby_attractions: [],
  });

  useEffect(() => {
    fetchVillaInfo();
  }, []);

  const fetchVillaInfo = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.villa.get();
      const data = response.data.data;
      setVillaInfo(data);
      
      if (data) {
        setFormData({
          villa_name: data.villa_name || '',
          description: data.description || '',
          location_address: data.location_address || '',
          location_city: data.location_city || '',
          location_country: data.location_country || '',
          location_map_url: data.location_map_url || '',
          bedrooms: data.bedrooms || '',
          bathrooms: data.bathrooms || '',
          max_capacity: data.max_capacity || '',
          area_sqft: data.area_sqft || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          contact_whatsapp: data.contact_whatsapp || '',
          check_in_time: data.check_in_time || '',
          check_out_time: data.check_out_time || '',
          cancellation_policy: data.cancellation_policy || '',
          house_rules: data.house_rules || '',
          amenities: data.amenities || [],
          nearby_attractions: data.nearby_attractions || [],
        });
      }
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load villa information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (villaInfo) {
        await adminAPI.villa.update(formData);
        alert('✅ Villa information updated successfully!');
      } else {
        await adminAPI.villa.create(formData);
        alert('✅ Villa information created successfully!');
      }
      setEditing(false);
      fetchVillaInfo();
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleArrayInput = (field, value) => {
    const items = value.split('\n').filter(item => item.trim() !== '');
    setFormData({ ...formData, [field]: items });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">Loading villa information...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-error">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Villa Information</h2>
          <button 
            onClick={() => setEditing(!editing)} 
            className={`admin-btn admin-btn-${editing ? 'secondary' : 'primary'} admin-btn-small`}
          >
            {editing ? '❌ Cancel' : '✏️ Edit'}
          </button>
        </div>

        {!editing && villaInfo ? (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>{villaInfo.villa_name}</h3>
            
            <div style={{ display: 'grid', gap: '30px' }}>
              {/* Basic Info */}
              <section>
                <h4 style={{ color: '#444', marginBottom: '10px' }}>📝 Description</h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{villaInfo.description}</p>
              </section>

              {/* Location */}
              <section>
                <h4 style={{ color: '#444', marginBottom: '10px' }}>📍 Location</h4>
                <p style={{ margin: '5px 0', color: '#666' }}>{villaInfo.location_address}</p>
                <p style={{ margin: '5px 0', color: '#666' }}>{villaInfo.location_city}, {villaInfo.location_country}</p>
                {villaInfo.location_map_url && (
                  <a href={villaInfo.location_map_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                    🗺️ View on Map
                  </a>
                )}
              </section>

              {/* Property Details */}
              <section>
                <h4 style={{ color: '#444', marginBottom: '10px' }}>🏠 Property Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div><strong>Bedrooms:</strong> {villaInfo.bedrooms}</div>
                  <div><strong>Bathrooms:</strong> {villaInfo.bathrooms}</div>
                  <div><strong>Max Capacity:</strong> {villaInfo.max_capacity} guests</div>
                  {villaInfo.area_sqft && <div><strong>Area:</strong> {villaInfo.area_sqft} sqft</div>}
                </div>
              </section>

              {/* Contact Info */}
              <section>
                <h4 style={{ color: '#444', marginBottom: '10px' }}>📞 Contact Information</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {villaInfo.contact_phone && <div><strong>Phone:</strong> {villaInfo.contact_phone}</div>}
                  {villaInfo.contact_email && <div><strong>Email:</strong> {villaInfo.contact_email}</div>}
                  {villaInfo.contact_whatsapp && <div><strong>WhatsApp:</strong> {villaInfo.contact_whatsapp}</div>}
                </div>
              </section>

              {/* Check-in/out */}
              <section>
                <h4 style={{ color: '#444', marginBottom: '10px' }}>⏰ Check-in & Check-out</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div><strong>Check-in:</strong> {villaInfo.check_in_time}</div>
                  <div><strong>Check-out:</strong> {villaInfo.check_out_time}</div>
                </div>
              </section>

              {/* Amenities */}
              {villaInfo.amenities && villaInfo.amenities.length > 0 && (
                <section>
                  <h4 style={{ color: '#444', marginBottom: '10px' }}>✨ Amenities</h4>
                  <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', margin: 0, paddingLeft: '20px' }}>
                    {villaInfo.amenities.map((amenity, i) => (
                      <li key={i} style={{ color: '#666' }}>{amenity}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Nearby Attractions */}
              {villaInfo.nearby_attractions && villaInfo.nearby_attractions.length > 0 && (
                <section>
                  <h4 style={{ color: '#444', marginBottom: '10px' }}>🏞️ Nearby Attractions</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {villaInfo.nearby_attractions.map((attraction, i) => (
                      <li key={i} style={{ color: '#666', marginBottom: '5px' }}>{attraction}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Policies */}
              {villaInfo.cancellation_policy && (
                <section>
                  <h4 style={{ color: '#444', marginBottom: '10px' }}>📋 Cancellation Policy</h4>
                  <p style={{ color: '#666', lineHeight: '1.6' }}>{villaInfo.cancellation_policy}</p>
                </section>
              )}

              {villaInfo.house_rules && (
                <section>
                  <h4 style={{ color: '#444', marginBottom: '10px' }}>📜 House Rules</h4>
                  <p style={{ color: '#666', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{villaInfo.house_rules}</p>
                </section>
              )}
            </div>
          </div>
        ) : editing ? (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Basic Info */}
              <section>
                <h4 style={{ marginBottom: '10px' }}>Basic Information</h4>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <input
                    type="text"
                    placeholder="Villa Name *"
                    value={formData.villa_name}
                    onChange={(e) => setFormData({ ...formData, villa_name: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <textarea
                    placeholder="Villa Description *"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="4"
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
              </section>

              {/* Location */}
              <section>
                <h4 style={{ marginBottom: '10px' }}>Location</h4>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <input
                    type="text"
                    placeholder="Address *"
                    value={formData.location_address}
                    onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input
                      type="text"
                      placeholder="City *"
                      value={formData.location_city}
                      onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                      type="text"
                      placeholder="Country *"
                      value={formData.location_country}
                      onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Google Maps URL"
                    value={formData.location_map_url}
                    onChange={(e) => setFormData({ ...formData, location_map_url: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </div>
              </section>

              {/* Property Details */}
              <section>
                <h4 style={{ marginBottom: '10px' }}>Property Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <input
                    type="number"
                    placeholder="Bedrooms *"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <input
                    type="number"
                    placeholder="Bathrooms *"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <input
                    type="number"
                    placeholder="Max Capacity *"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <input
                    type="number"
                    placeholder="Area (sqft)"
                    value={formData.area_sqft}
                    onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </div>
              </section>

              {/* Contact Info */}
              <section>
                <h4 style={{ marginBottom: '10px' }}>Contact Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <input
                    type="text"
                    placeholder="Phone Number *"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp Number"
                    value={formData.contact_whatsapp}
                    onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </div>
              </section>

              {/* Check-in/out */}
              <section>
                <h4 style={{ marginBottom: '10px' }}>Check-in & Check-out Times</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input
                    type="time"
                    placeholder="Check-in Time *"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                  <input
                    type="time"
                    placeholder="Check-out Time *"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </div>
              </section>

              {/* Amenities & Attractions */}
              <section>
                <h4 style={{ marginBottom: '10px' }}>Amenities & Attractions</h4>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <textarea
                    placeholder="Amenities (one per line)"
                    value={formData.amenities.join('\n')}
                    onChange={(e) => handleArrayInput('amenities', e.target.value)}
                    rows="5"
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontFamily: 'monospace' }}
                  />
                  <textarea
                    placeholder="Nearby Attractions (one per line)"
                    value={formData.nearby_attractions.join('\n')}
                    onChange={(e) => handleArrayInput('nearby_attractions', e.target.value)}
                    rows="5"
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontFamily: 'monospace' }}
                  />
                </div>
              </section>

              {/* Policies */}
              <section>
                <h4 style={{ marginBottom: '10px' }}>Policies & Rules</h4>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <textarea
                    placeholder="Cancellation Policy"
                    value={formData.cancellation_policy}
                    onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                    rows="4"
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                  <textarea
                    placeholder="House Rules"
                    value={formData.house_rules}
                    onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })}
                    rows="4"
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
              </section>

              <button type="submit" className="admin-btn admin-btn-success">
                ✅ {villaInfo ? 'Update Villa Information' : 'Create Villa Information'}
              </button>
            </div>
          </form>
        ) : (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No villa information found. Click "Edit" to create it.
          </p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVilla;
