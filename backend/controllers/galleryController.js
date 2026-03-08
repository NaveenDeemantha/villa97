const pool = require('../config/database');

// Get all gallery images
const getAllGalleryImages = async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let query = 'SELECT * FROM gallery WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (featured !== undefined) {
      query += ` AND is_featured = $${paramCount}`;
      params.push(featured === 'true');
      paramCount++;
    }

    query += ' ORDER BY display_order, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get gallery image by ID
const getGalleryImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM gallery WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching gallery image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add new gallery image (admin only)
const addGalleryImage = async (req, res) => {
  try {
    const { title, image_url, caption, category, display_order, is_featured } = req.body;

    if (!image_url) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const result = await pool.query(
      `INSERT INTO gallery (title, image_url, caption, category, display_order, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, image_url, caption, category || 'general', display_order || 0, is_featured || false]
    );

    res.status(201).json({
      message: 'Image added successfully',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update gallery image (admin only)
const updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, caption, category, display_order, is_featured } = req.body;

    const result = await pool.query(
      `UPDATE gallery 
       SET title = COALESCE($1, title),
           image_url = COALESCE($2, image_url),
           caption = COALESCE($3, caption),
           category = COALESCE($4, category),
           display_order = COALESCE($5, display_order),
           is_featured = COALESCE($6, is_featured)
       WHERE id = $7
       RETURNING *`,
      [title, image_url, caption, category, display_order, is_featured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({
      message: 'Image updated successfully',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete gallery image (admin only)
const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM gallery WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get gallery categories
const getGalleryCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM gallery ORDER BY category'
    );

    res.json(result.rows.map(row => row.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllGalleryImages,
  getGalleryImageById,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  getGalleryCategories
};
