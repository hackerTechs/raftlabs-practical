const express = require('express');
const { validateStatusUpdate } = require('../middleware/validator');
const { authenticate, adminOnly } = require('../middleware/auth');

/**
 * Admin-only routes (require authentication + admin role).
 */
const createAdminRoutes = (orderController) => {
  const router = express.Router();

  router.use(authenticate);
  router.use(adminOnly);

  router.get('/orders', orderController.getAllOrders);
  router.get('/orders/:id', orderController.getOrder);
  router.patch('/orders/:id/status', validateStatusUpdate, orderController.updateOrderStatus);
  router.delete('/orders/:id', orderController.deleteOrder);

  return router;
};

module.exports = createAdminRoutes;

