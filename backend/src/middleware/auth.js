const config = require('../config');
const { AppError } = require('./errorHandler');
const { isValidEmail } = require('./validator');

/**
 * Middleware: read the X-User-Email header, validate it,
 * and attach `req.user = { email }`.
 */
function authenticate(req, _res, next) {
  const email = req.headers['x-user-email'];

  if (!email || !isValidEmail(email)) {
    return next(new AppError('A valid email is required (X-User-Email header)', 401));
  }

  req.user = { email: email.trim().toLowerCase() };
  next();
}

/**
 * Middleware: require admin role (must come after `authenticate`).
 */
function adminOnly(req, _res, next) {
  if (!req.user || req.user.email !== config.adminEmail) {
    return next(new AppError('Admin access required', 403));
  }
  next();
}

module.exports = { authenticate, adminOnly };
