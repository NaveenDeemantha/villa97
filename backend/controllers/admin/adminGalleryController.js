const db = require('../../config/database');

// Get all gallery images with filters (admin only)
exports.getAllImages = async (req, res) => {
  try {
    const { category, is_featured } = req.query;

    let query = 'SELECT * FROM gallery WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (is_featured !== undefined) {
      query += ` AND is_featured = $${paramCount}`;
      params.push(is_featured === 'true');
      paramCount++;
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const result = await db.query(query, params);
    res.json({ 
      success: true, 
      count: result.rows.length,
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get image by ID (admin only)
exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT * FROM gallery WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add new image (admin only)
exports.addImage = async (req, res) => {
  try {
    const { title, image_url, caption, category, display_order, is_featured } = req.body;

    // Validate required fields
    if (!image_url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: image_url' 
      });
    }

    const query = `
      INSERT INTO gallery 
      (title, image_url, caption, category, display_order, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [
      title || null,
      image_url,
      caption || null,
      category || 'general',
      display_order || 0,
      is_featured || false
    ]);

    res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update image (admin only)
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, caption, category, display_order, is_featured } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount}`);
      values.push(image_url);
      paramCount++;
    }

    if (caption !== undefined) {
      updates.push(`caption = $${paramCount}`);
      values.push(caption);
      paramCount++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount}`);
      values.push(display_order);
      paramCount++;
    }

    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramCount}`);
      values.push(is_featured);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);

    const query = `
      UPDATE gallery 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete image (admin only)
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM gallery WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.json({ 
      success: true, 
      message: 'Image deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle featured status (admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE gallery SET is_featured = NOT is_featured WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.json({
      success: true,
      message: `Image ${result.rows[0].is_featured ? 'marked as featured' : 'unmarked as featured'}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk upload images (admin only)
exports.bulkUpload = async (req, res) => {
  try {
    const { images } = req.body; // Array of image objects

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'images must be a non-empty array' 
      });
    }

    const insertedImages = [];

    for (const image of images) {
      if (!image.image_url) {
        continue; // Skip images without URL
      }

      const query = `
        INSERT INTO gallery 
        (title, image_url, caption, category, display_order, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await db.query(query, [
        image.title || null,
        image.image_url,
        image.caption || null,
        image.category || 'general',
        image.display_order || 0,
        image.is_featured || false
      ]);

      insertedImages.push(result.rows[0]);
    }

    res.status(201).json({
      success: true,
      message: `${insertedImages.length} images uploaded successfully`,
      data: insertedImages
    });
  } catch (error) {
    console.error('Error bulk uploading images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reorder gallery images (admin only)
exports.reorderImages = async (req, res) => {
  try {
    const { image_orders } = req.body; // Array of { id, display_order }

    if (!Array.isArray(image_orders)) {
      return res.status(400).json({ 
        success: false, 
        message: 'image_orders must be an array of {id, display_order}' 
      });
    }

    for (const item of image_orders) {
      await db.query(
        'UPDATE gallery SET display_order = $1 WHERE id = $2',
        [item.display_order, item.id]
      );
    }

    res.json({
      success: true,
      message: 'Gallery images reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get gallery statistics (admin only)
exports.getGalleryStatistics = async (req, res) => {
  try {
    // Total images
    const totalResult = await db.query('SELECT COUNT(*) as total FROM gallery');
    
    // Images by category
    const categoryResult = await db.query(`
      SELECT category, COUNT(*) as count
      FROM gallery
      GROUP BY category
      ORDER BY count DESC
    `);

    // Featured images
    const featuredResult = await db.query('SELECT COUNT(*) as count FROM gallery WHERE is_featured = true');

    res.json({
      success: true,
      data: {
        total: parseInt(totalResult.rows[0].total),
        byCategory: categoryResult.rows,
        featured: parseInt(featuredResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching gallery statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all categories (admin only)
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT category, COUNT(*) as image_count
      FROM gallery
      GROUP BY category
      ORDER BY category
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
