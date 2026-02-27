const Redis = require('ioredis');
const config = require('../config');

let client = null;

/**
 * Get the current Redis client. Creates one if not yet initialised.
 */
function getClient() {
  if (!client) {
    client = new Redis(config.redisUrl);
  }
  return client;
}

/**
 * Override the client (used in tests with ioredis-mock).
 */
function setClient(newClient) {
  client = newClient;
}

/**
 * Gracefully disconnect.
 */
async function disconnect() {
  if (client) {
    await client.quit();
    client = null;
  }
}

module.exports = { getClient, setClient, disconnect };

