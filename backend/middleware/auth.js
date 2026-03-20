const passport = require('../config/passport');

// Protect routes - verify JWT token using Passport
exports.protect = passport.authenticate('jwt', { session: false });

// Legacy middleware (for backward compatibility)
exports.authMiddleware = exports.protect;

// Admin middleware
exports.adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
};

// Authorize based on role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }

    next();
  };
};
