const Redis = require('ioredis-mock');
const { setClient } = require('../src/db/redisClient');
const { seedMenuItems } = require('../src/db/seed');
const createApp = require('../src/app');

/**
 * Set up a fresh Redis mock, seed menu data, and return the app.
 */
async function setupTestEnv() {
  const mockClient = new Redis();
  setClient(mockClient);
  await seedMenuItems();
  const app = createApp();
  return { app, client: mockClient };
}

/** Default user email for tests */
const USER_EMAIL = 'user@test.com';

/** Admin email */
const ADMIN_EMAIL = 'admin@mail.com';

module.exports = { setupTestEnv, USER_EMAIL, ADMIN_EMAIL };
