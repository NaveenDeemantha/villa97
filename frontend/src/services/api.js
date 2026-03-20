import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Villa Info APIs (Single Villa)
export const villaAPI = {
  getInfo: () => api.get('/villa'),
  update: (data) => api.put('/villa', data),
  checkAvailability: (checkIn, checkOut) => 
    api.get('/villa/availability', { params: { check_in: checkIn, check_out: checkOut } }),
};

// Package APIs
export const packageAPI = {
  getAll: () => api.get('/packages'),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

// Gallery APIs
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  getCategories: () => api.get('/gallery/categories'),
  add: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// Booking APIs
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.delete(`/bookings/${id}`),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
};

// User/Auth APIs
export const userAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/profile'),
};

// Admin APIs
export const adminAPI = {
  // Dashboard
  dashboard: {
    getStats: () => api.get('/admin/dashboard/stats'),
    getBookingAnalytics: () => api.get('/admin/dashboard/analytics/bookings'),
    getRevenueAnalytics: (period = 'month') => api.get('/admin/dashboard/analytics/revenue', { params: { period } }),
    getUserStats: () => api.get('/admin/dashboard/analytics/users'),
    getSystemHealth: () => api.get('/admin/dashboard/system'),
  },
  
  // Bookings Management
  bookings: {
    getAll: (params) => api.get('/admin/bookings', { params }),
    getStats: () => api.get('/admin/bookings/stats'),
    create: (data) => api.post('/admin/bookings', data),
    update: (id, data) => api.put(`/admin/bookings/${id}`, data),
    updateStatus: (id, status) => api.patch(`/admin/bookings/${id}/status`, { status }),
    updatePayment: (id, payment_status) => api.patch(`/admin/bookings/${id}/payment`, { payment_status }),
    delete: (id) => api.delete(`/admin/bookings/${id}`),
  },
  
  // Users Management
  users: {
    getAll: (params) => api.get('/admin/users', { params }),
    getById: (id) => api.get(`/admin/users/${id}`),
    getStats: () => api.get('/admin/users/stats'),
    create: (data) => api.post('/admin/users', data),
    update: (id, data) => api.put(`/admin/users/${id}`, data),
    changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
    delete: (id) => api.delete(`/admin/users/${id}`),
  },
  
  // Packages Management
  packages: {
    getAll: () => api.get('/admin/packages'),
    getById: (id) => api.get(`/admin/packages/${id}`),
    getStats: () => api.get('/admin/packages/stats'),
    create: (data) => api.post('/admin/packages', data),
    update: (id, data) => api.put(`/admin/packages/${id}`, data),
    toggleAvailability: (id) => api.patch(`/admin/packages/${id}/availability`),
    reorder: (package_orders) => api.post('/admin/packages/reorder', { package_orders }),
    delete: (id) => api.delete(`/admin/packages/${id}`),
  },
  
  // Gallery Management
  gallery: {
    getAll: (params) => api.get('/admin/gallery', { params }),
    getById: (id) => api.get(`/admin/gallery/${id}`),
    getStats: () => api.get('/admin/gallery/stats'),
    getCategories: () => api.get('/admin/gallery/categories'),
    add: (data) => api.post('/admin/gallery', data),
    bulkUpload: (images) => api.post('/admin/gallery/bulk', { images }),
    update: (id, data) => api.put(`/admin/gallery/${id}`, data),
    toggleFeatured: (id) => api.patch(`/admin/gallery/${id}/featured`),
    reorder: (image_orders) => api.post('/admin/gallery/reorder', { image_orders }),
    delete: (id) => api.delete(`/admin/gallery/${id}`),
  },
  
  // Villa Management
  villa: {
    get: () => api.get('/admin/villa'),
    getStats: () => api.get('/admin/villa/stats'),
    update: (data) => api.put('/admin/villa', data),
    toggleAvailability: () => api.patch('/admin/villa/availability'),
    addAmenity: (amenity) => api.post('/admin/villa/amenities', { amenity }),
    removeAmenity: (amenity) => api.delete('/admin/villa/amenities', { data: { amenity } }),
    addFeature: (feature) => api.post('/admin/villa/features', { feature }),
    removeFeature: (feature) => api.delete('/admin/villa/features', { data: { feature } }),
  },
};

export default api;
