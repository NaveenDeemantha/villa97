const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getVillaInfo,
  updateVillaInfo,
  checkAvailability
} = require('../controllers/villaInfoController');

// Public routes
router.get('/', getVillaInfo);
router.get('/availability', checkAvailability);

// Protected routes (admin only)
router.put('/', protect, authorize('admin'), updateVillaInfo);

module.exports = router;
