const express = require('express');
const cors = require('cors');
require('dotenv').config()
const config = require('./config');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const createOrderRoutes = require('./routes/orderRoutes');
const createAdminRoutes = require('./routes/adminRoutes');
const createOrderController = require('./controllers/orderController');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

/**
 * Creates and configures the Express app.
 * @param {Function} getIo – returns the Socket.io server instance (or null).
 */
const createApp = (getIo = () => null) => {
  const app = express();

  // ── Global Middleware ───────────────────────────────────────────────────
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // ── Health Check ────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  // ── Routes ──────────────────────────────────────────────────────────────
  const orderController = createOrderController(getIo);

  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);                       // public
  app.use('/api/orders', createOrderRoutes(orderController));  // authenticated
  app.use('/api/admin', createAdminRoutes(orderController));   // admin only

  // ── Error Handling ──────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
