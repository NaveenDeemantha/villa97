import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [villaInfo, setVillaInfo] = useState(null);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVillaInfo();
    fetchFeaturedImages();
  }, []);

  const fetchVillaInfo = async () => {
    try {
      const response = await api.get('/villa');
      setVillaInfo(response.data);
    } catch (error) {
      console.error('Error fetching villa info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedImages = async () => {
    try {
      const response = await api.get('/gallery', { params: { featured: 'true' } });
      setFeaturedImages(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching featured images:', error);
    }
  };

  if (loading || !villaInfo) {
    return <div style={styles.loading}>Loading Villa 97...</div>;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>{villaInfo.name}</h1>
          <p style={styles.heroTagline}>{villaInfo.tagline}</p>
          <div style={styles.heroButtons}>
            <Link to="/packages" style={{...styles.btn, ...styles.btnPrimary}}>
              View Packages
            </Link>
            <Link to="/gallery" style={{...styles.btn, ...styles.btnSecondary}}>
              Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* About Villa Section */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>About Villa 97</h2>
          <p style={styles.description}>{villaInfo.description}</p>
          
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>🏠</span>
              <h3>{villaInfo.bedrooms} Bedrooms</h3>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>🚿</span>
              <h3>{villaInfo.bathrooms} Bathrooms</h3>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>👥</span>
              <h3>Up to {villaInfo.max_guests} Guests</h3>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>📐</span>
              <h3>{villaInfo.square_meters}m²</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section style={{...styles.section, background: '#f8f9fa'}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Amenities</h2>
          <div style={styles.amenitiesGrid}>
            {villaInfo.amenities?.map((amenity, index) => (
              <div key={index} style={styles.amenityItem}>
                <span style={styles.checkmark}>✓</span> {amenity}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Featured Highlights</h2>
          <div style={styles.featuresGrid}>
            {villaInfo.features?.slice(0, 6).map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>⭐</div>
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {featuredImages.length > 0 && (
        <section style={{...styles.section, background: '#1a1a1a', color: 'white'}}>
          <div style={styles.container}>
            <h2 style={{...styles.sectionTitle, color: 'white'}}>Gallery</h2>
            <div style={styles.galleryPreview}>
              {featuredImages.map((image) => (
                <div key={image.id} style={styles.galleryItem}>
                  <img 
                    src={image.image_url} 
                    alt={image.title} 
                    style={styles.galleryImage}
                  />
                </div>
              ))}
            </div>
            <div style={styles.centerButton}>
              <Link to="/gallery" style={{...styles.btn, ...styles.btnLight}}>
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Location</h2>
          <p style={styles.locationText}>
            📍 {villaInfo.address}
          </p>
          {villaInfo.nearby_attractions && (
            <>
              <h3 style={styles.nearbyTitle}>Nearby Attractions</h3>
              <ul style={styles.nearbyList}>
                {villaInfo.nearby_attractions.map((attraction, index) => (
                  <li key={index}>{attraction}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={{...styles.sectionTitle, color: 'white', marginBottom: '1.5rem'}}>
            Ready to Book Your Stay?
          </h2>
          <p style={{color: 'white', fontSize: '1.2rem', marginBottom: '2rem'}}>
            Choose from our specially curated packages for an unforgettable experience
          </p>
          <Link to="/packages" style={{...styles.btn, ...styles.btnLight, fontSize: '1.2rem', padding: '1rem 3rem'}}>
            Explore Packages
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles = {
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
    fontSize: '1.5rem',
    color: '#666',
  },
  hero: {
    height: '80vh',
    backgroundImage: 'url(https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    background: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '20px',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
  },
  heroTagline: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    maxWidth: '600px',
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  section: {
    padding: '60px 20px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#1a1a1a',
  },
  description: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#555',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 3rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '30px',
  },
  infoCard: {
    background: '#f8f9fa',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  infoIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '10px',
  },
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  amenityItem: {
    padding: '15px',
    background: 'white',
    borderRadius: '8px',
    fontSize: '1.05rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },
  checkmark: {
    color: '#28a745',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    background: '#fff',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center',
    transition: 'transform 0.3s',
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  galleryPreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  galleryItem: {
    borderRadius: '12px',
    overflow: 'hidden',
    height: '250px',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  centerButton: {
    textAlign: 'center',
  },
  locationText: {
    fontSize: '1.3rem',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#555',
  },
  nearbyTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
  nearbyList: {
    listStyle: 'none',
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '10px',
  },
  ctaSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '80px 20px',
    textAlign: 'center',
  },
  btn: {
    display: 'inline-block',
    padding: '12px 30px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s',
    cursor: 'pointer',
    border: 'none',
  },
  btnPrimary: {
    background: '#4a90e2',
    color: 'white',
  },
  btnSecondary: {
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
  },
  btnLight: {
    background: 'white',
    color: '#667eea',
  },
};

export default Home;
