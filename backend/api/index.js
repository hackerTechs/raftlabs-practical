const createApp = require('../src/app');
const { getClient } = require('../src/db/redisClient');
const { seedMenuItems } = require('../src/db/seed');

// Create Express app (no Socket.io in serverless)
const app = createApp();

// Lazy-initialise Redis + seed data on first cold-start request
let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    try {
      const client = getClient();
      await client.ping();
      await seedMenuItems();
      initialized = true;
    } catch (err) {
      console.error('Redis init failed:', err.message);
      // Don't block the request — let the route handlers fail
      // with their own Redis errors if needed
    }
  }

  return app(req, res);
};

