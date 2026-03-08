import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await api.get('/gallery', { params });
      setGallery(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/gallery/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
    fetchCategories();
  }, [fetchGallery, fetchCategories]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Villa Gallery</h1>
        <p style={styles.subtitle}>
          Explore the beauty of Villa 97 through our curated photo collection
        </p>
      </div>

      {/* Category Filter */}
      <div style={styles.filterContainer}>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.filterButtonActive : {})
          }}
          onClick={() => setFilter('all')}
        >
          All Photos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            style={{
              ...styles.filterButton,
              ...(filter === category ? styles.filterButtonActive : {})
            }}
            onClick={() => setFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={styles.loading}>Loading gallery...</div>
      ) : (
        <div style={styles.galleryGrid}>
          {gallery.map((image) => (
            <div key={image.id} style={styles.galleryItem}>
              <img
                src={image.image_url}
                alt={image.title || 'Villa 97'}
                style={styles.image}
              />
              {(image.title || image.caption) && (
                <div style={styles.imageCaption}>
                  {image.title && <h3 style={styles.imageTitle}>{image.title}</h3>}
                  {image.caption && <p style={styles.imageCaptionText}>{image.caption}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && gallery.length === 0 && (
        <div style={styles.noResults}>
          <p>No images found in this category.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    color: '#1a1a1a',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '40px',
  },
  filterButton: {
    padding: '10px 20px',
    border: '2px solid #ddd',
    background: 'white',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.3s',
  },
  filterButtonActive: {
    background: '#4a90e2',
    color: 'white',
    borderColor: '#4a90e2',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  galleryItem: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    display: 'block',
  },
  imageCaption: {
    padding: '15px',
    background: 'white',
  },
  imageTitle: {
    fontSize: '1.1rem',
    margin: '0 0 5px 0',
    color: '#1a1a1a',
  },
  imageCaptionText: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '1.1rem',
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '1.1rem',
    color: '#999',
  },
};

export default Gallery;
