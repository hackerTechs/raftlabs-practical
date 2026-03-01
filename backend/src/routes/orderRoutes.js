const express = require('express');
const { validateOrderBody } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

/**
 * User-facing order routes (all require authentication).
 */
const createOrderRoutes = (orderController) => {
  const router = express.Router();

  router.use(authenticate);

  router.get('/', orderController.getUserOrders);
  router.get('/:id', orderController.getUserOrder);
  router.post('/', validateOrderBody, orderController.createOrder);

  return router;
};

module.exports = createOrderRoutes;
