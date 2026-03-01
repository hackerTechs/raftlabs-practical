/**
 * Initialise Socket.io event handlers.
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Allow clients to join a room specific to their order
    socket.on('trackOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[Socket] ${socket.id} tracking order ${orderId}`);
    });

    // Allow clients to stop tracking an order
    socket.on('untrackOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initializeSocket;

