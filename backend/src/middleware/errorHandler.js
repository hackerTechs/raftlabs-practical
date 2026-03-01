/**
 * Custom error class with status code support.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 handler – catches requests to undefined routes.
 */
const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

/**
 * Global error handler middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} – ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = { AppError, notFoundHandler, errorHandler };

