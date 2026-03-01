const store = require('../db/store');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config');

// Track active simulation timers so they can be cleaned up
const activeSimulations = new Set();

const orderService = {
  /**
   * Retrieve all orders (admin).
   */
  getAllOrders: async () => {
    return store.orders.getAll();
  },

  /**
   * Retrieve orders for a specific user.
   */
  getOrdersByUser: async (email) => {
    return store.orders.getByUserEmail(email);
  },

  /**
   * Retrieve a single order by ID.
   * If `userEmail` is provided, verifies the order belongs to that user.
   */
  getOrderById: async (id, userEmail) => {
    const order = await store.orders.getById(id);
    if (!order) throw new AppError('Order not found', 404);

    if (userEmail && order.userEmail !== userEmail) {
      throw new AppError('Order not found', 404);
    }

    return order;
  },

  /**
   * Place a new order.
   */
  createOrder: async (orderData, userEmail) => {
    const { items, customer } = orderData;

    // Resolve menu items and compute line totals
    const resolvedItems = [];
    for (const item of items) {
      const menuItem = await store.menu.getById(item.menuItemId);
      if (!menuItem) {
        throw new AppError(`Menu item with id "${item.menuItemId}" not found`, 400);
      }
      resolvedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        lineTotal: +(menuItem.price * item.quantity).toFixed(2),
      });
    }

    const totalAmount = +resolvedItems
      .reduce((sum, i) => sum + i.lineTotal, 0)
      .toFixed(2);

    const order = await store.orders.create({
      items: resolvedItems,
      customer: {
        name: customer.name.trim(),
        address: customer.address.trim(),
        phone: customer.phone.trim(),
      },
      userEmail,
      totalAmount,
    });

    return order;
  },

  /**
   * Update order status.
   */
  updateOrderStatus: async (id, status) => {
    const existing = await store.orders.getById(id);
    if (!existing) throw new AppError('Order not found', 404);

    // Prevent going backwards in the status flow
    const flow = config.orderStatusFlow;
    const currentIndex = flow.indexOf(existing.status);
    const newIndex = flow.indexOf(status);

    if (newIndex < currentIndex) {
      throw new AppError('Cannot revert to a previous status', 400);
    }

    const updated = await store.orders.updateStatus(id, status);
    return updated;
  },

  /**
   * Delete an order.
   */
  deleteOrder: async (id) => {
    const existing = await store.orders.getById(id);
    if (!existing) throw new AppError('Order not found', 404);
    return store.orders.delete(id);
  },

  /**
   * Simulate automatic order status progression.
   * Returns a function to cancel the simulation.
   */
  simulateStatusProgression: (orderId, io) => {
    const flow = config.orderStatusFlow;
    let currentStep = 0;

    const interval = setInterval(async () => {
      currentStep++;
      if (currentStep >= flow.length) {
        clearInterval(interval);
        activeSimulations.delete(interval);
        return;
      }

      const nextStatus = flow[currentStep];
      try {
        const updated = await orderService.updateOrderStatus(orderId, nextStatus);
        if (io) {
          io.emit('orderStatusUpdate', {
            orderId: updated.id,
            status: updated.status,
            updatedAt: updated.updatedAt,
          });
        }
      } catch {
        clearInterval(interval);
        activeSimulations.delete(interval);
      }
    }, config.statusTransitionDelay);

    activeSimulations.add(interval);

    return () => {
      clearInterval(interval);
      activeSimulations.delete(interval);
    };
  },

  /**
   * Clear all active simulation timers (for test cleanup).
   */
  clearAllSimulations: () => {
    for (const interval of activeSimulations) {
      clearInterval(interval);
    }
    activeSimulations.clear();
  },
};

module.exports = orderService;
