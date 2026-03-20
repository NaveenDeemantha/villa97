const express = require('express');
const router = express.Router();

// Import middleware
const { protect, adminMiddleware } = require('../../middleware/auth');

// Import admin controllers
const adminDashboardController = require('../../controllers/admin/adminDashboardController');
const adminBookingController = require('../../controllers/admin/adminBookingController');
const adminUserController = require('../../controllers/admin/adminUserController');
const adminPackageController = require('../../controllers/admin/adminPackageController');
const adminGalleryController = require('../../controllers/admin/adminGalleryController');
const adminVillaController = require('../../controllers/admin/adminVillaController');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(adminMiddleware);

// ==================== DASHBOARD ROUTES ====================
// GET /api/admin/dashboard/stats - Get dashboard overview statistics
router.get('/dashboard/stats', adminDashboardController.getDashboardStats);

// GET /api/admin/dashboard/analytics/bookings - Get booking analytics
router.get('/dashboard/analytics/bookings', adminDashboardController.getBookingAnalytics);

// GET /api/admin/dashboard/analytics/revenue - Get revenue analytics
router.get('/dashboard/analytics/revenue', adminDashboardController.getRevenueAnalytics);

// GET /api/admin/dashboard/analytics/users - Get user statistics
router.get('/dashboard/analytics/users', adminDashboardController.getUserStats);

// GET /api/admin/dashboard/system - Get system health status
router.get('/dashboard/system', adminDashboardController.getSystemHealth);

// ==================== BOOKING MANAGEMENT ROUTES ====================
// GET /api/admin/bookings - Get all bookings with filters
router.get('/bookings', adminBookingController.getAllBookings);

// GET /api/admin/bookings/stats - Get booking statistics
router.get('/bookings/stats', adminBookingController.getBookingStatistics);

// POST /api/admin/bookings - Create booking on behalf of user
router.post('/bookings', adminBookingController.createBooking);

// PUT /api/admin/bookings/:id - Update booking details
router.put('/bookings/:id', adminBookingController.updateBooking);

// PATCH /api/admin/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', adminBookingController.updateBookingStatus);

// PATCH /api/admin/bookings/:id/payment - Update payment status
router.patch('/bookings/:id/payment', adminBookingController.updatePaymentStatus);

// DELETE /api/admin/bookings/:id - Delete booking
router.delete('/bookings/:id', adminBookingController.deleteBooking);

// ==================== USER MANAGEMENT ROUTES ====================
// GET /api/admin/users - Get all users with filters
router.get('/users', adminUserController.getAllUsers);

// GET /api/admin/users/stats - Get user statistics
router.get('/users/stats', adminUserController.getUserStatistics);

// GET /api/admin/users/:id - Get user by ID with details
router.get('/users/:id', adminUserController.getUserById);

// POST /api/admin/users - Create new user
router.post('/users', adminUserController.createUser);

// PUT /api/admin/users/:id - Update user details
router.put('/users/:id', adminUserController.updateUser);

// PATCH /api/admin/users/:id/role - Toggle/change user role
router.patch('/users/:id/role', adminUserController.toggleUserRole);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminUserController.deleteUser);

// ==================== PACKAGE MANAGEMENT ROUTES ====================
// GET /api/admin/packages - Get all packages with statistics
router.get('/packages', adminPackageController.getAllPackages);

// GET /api/admin/packages/stats - Get package statistics
router.get('/packages/stats', adminPackageController.getPackageStatistics);

// GET /api/admin/packages/:id - Get package by ID with details
router.get('/packages/:id', adminPackageController.getPackageById);

// POST /api/admin/packages - Create new package
router.post('/packages', adminPackageController.createPackage);

// PUT /api/admin/packages/:id - Update package
router.put('/packages/:id', adminPackageController.updatePackage);

// PATCH /api/admin/packages/:id/availability - Toggle package availability
router.patch('/packages/:id/availability', adminPackageController.togglePackageAvailability);

// POST /api/admin/packages/reorder - Reorder packages
router.post('/packages/reorder', adminPackageController.reorderPackages);

// DELETE /api/admin/packages/:id - Delete package
router.delete('/packages/:id', adminPackageController.deletePackage);

// ==================== GALLERY MANAGEMENT ROUTES ====================
// GET /api/admin/gallery - Get all gallery images
router.get('/gallery', adminGalleryController.getAllImages);

// GET /api/admin/gallery/stats - Get gallery statistics
router.get('/gallery/stats', adminGalleryController.getGalleryStatistics);

// GET /api/admin/gallery/categories - Get all categories
router.get('/gallery/categories', adminGalleryController.getCategories);

// GET /api/admin/gallery/:id - Get image by ID
router.get('/gallery/:id', adminGalleryController.getImageById);

// POST /api/admin/gallery - Add new image
router.post('/gallery', adminGalleryController.addImage);

// POST /api/admin/gallery/bulk - Bulk upload images
router.post('/gallery/bulk', adminGalleryController.bulkUpload);

// PUT /api/admin/gallery/:id - Update image
router.put('/gallery/:id', adminGalleryController.updateImage);

// PATCH /api/admin/gallery/:id/featured - Toggle featured status
router.patch('/gallery/:id/featured', adminGalleryController.toggleFeatured);

// POST /api/admin/gallery/reorder - Reorder images
router.post('/gallery/reorder', adminGalleryController.reorderImages);

// DELETE /api/admin/gallery/:id - Delete image
router.delete('/gallery/:id', adminGalleryController.deleteImage);

// ==================== VILLA MANAGEMENT ROUTES ====================
// GET /api/admin/villa - Get villa information
router.get('/villa', adminVillaController.getVillaInfo);

// GET /api/admin/villa/stats - Get villa statistics
router.get('/villa/stats', adminVillaController.getVillaStatistics);

// PUT /api/admin/villa - Update villa information
router.put('/villa', adminVillaController.updateVillaInfo);

// PATCH /api/admin/villa/availability - Toggle villa availability
router.patch('/villa/availability', adminVillaController.toggleAvailability);

// POST /api/admin/villa/amenities - Add amenity
router.post('/villa/amenities', adminVillaController.addAmenity);

// DELETE /api/admin/villa/amenities - Remove amenity
router.delete('/villa/amenities', adminVillaController.removeAmenity);

// POST /api/admin/villa/features - Add feature
router.post('/villa/features', adminVillaController.addFeature);

// DELETE /api/admin/villa/features - Remove feature
router.delete('/villa/features', adminVillaController.removeFeature);

module.exports = router;
