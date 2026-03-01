const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./app');
const config = require('./config');
const initializeSocket = require('./socket/orderSocket');
const { getClient } = require('./db/redisClient');
const { seedMenuItems } = require('./db/seed');

// ── Socket.io instance holder ─────────────────────────────────────────────
let io = null;
const getIo = () => io;

// ── Create Express app & HTTP server ──────────────────────────────────────
const app = createApp(getIo);
const server = http.createServer(app);

// ── Attach Socket.io ──────────────────────────────────────────────────────
io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

initializeSocket(io);

// ── Start Listening ───────────────────────────────────────────────────────
(async () => {
  try {
    // Verify Redis connection
    const client = getClient();
    await client.ping();
    console.log('Connected to Redis');

    // Seed menu data
    await seedMenuItems();

    server.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Socket.io ready`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();

module.exports = server;
