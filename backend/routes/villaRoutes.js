const express = require('express');
const router = express.Router();
const villaController = require('../controllers/villaController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', villaController.getAllVillas);
router.get('/:id', villaController.getVillaById);
router.get('/:id/availability', villaController.checkAvailability);

// Protected routes (require authentication)
router.post('/', authMiddleware, villaController.createVilla);
router.put('/:id', authMiddleware, villaController.updateVilla);
router.delete('/:id', authMiddleware, villaController.deleteVilla);

module.exports = router;
