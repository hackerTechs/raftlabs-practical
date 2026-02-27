const orderService = require('../services/orderService');

/**
 * Factory: creates the order controller with socket.io instance reference.
 */
const createOrderController = (getIo) => ({
  // ── User-scoped endpoints ───────────────────────────────────────────────

  /**
   * GET /api/orders — user's own orders
   */
  getUserOrders: async (req, res, next) => {
    try {
      const orders = await orderService.getOrdersByUser(req.user.email);
      res.json({ success: true, data: orders, count: orders.length });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders/:id — user's own order by ID
   */
  getUserOrder: async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user.email);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/orders — place an order
   */
  createOrder: async (req, res, next) => {
    try {
      const order = await orderService.createOrder(req.body, req.user.email);
      const io = getIo();

      if (io) {
        io.emit('newOrder', order);
      }

      // Start simulated status progression
      orderService.simulateStatusProgression(order.id, io);

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  // ── Admin endpoints ─────────────────────────────────────────────────────

  /**
   * GET /api/admin/orders — all orders (admin)
   */
  getAllOrders: async (_req, res, next) => {
    try {
      const orders = await orderService.getAllOrders();
      res.json({ success: true, data: orders, count: orders.length });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/orders/:id — any order by ID (admin)
   */
  getOrder: async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/orders/:id/status — update status (admin)
   */
  updateOrderStatus: async (req, res, next) => {
    try {
      const updated = await orderService.updateOrderStatus(req.params.id, req.body.status);
      const io = getIo();

      if (io) {
        io.emit('orderStatusUpdate', {
          orderId: updated.id,
          status: updated.status,
          updatedAt: updated.updatedAt,
        });
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/admin/orders/:id — delete order (admin)
   */
  deleteOrder: async (req, res, next) => {
    try {
      await orderService.deleteOrder(req.params.id);
      res.json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
});

module.exports = createOrderController;
