const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllGalleryImages,
  getGalleryImageById,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  getGalleryCategories
} = require('../controllers/galleryController');

// Public routes
router.get('/', getAllGalleryImages);
router.get('/categories', getGalleryCategories);
router.get('/:id', getGalleryImageById);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), addGalleryImage);
router.put('/:id', protect, authorize('admin'), updateGalleryImage);
router.delete('/:id', protect, authorize('admin'), deleteGalleryImage);

module.exports = router;
