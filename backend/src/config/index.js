const config = {
  port: process.env.PORT || 4000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  adminEmail: 'admin@mail.com',
  orderStatusFlow: ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'],
  statusTransitionDelay: process.env.STATUS_DELAY || 8000,
};

module.exports = config;
