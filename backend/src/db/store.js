const { v4: uuidv4 } = require('uuid');
const { getClient } = require('./redisClient');

// ── Keys ────────────────────────────────────────────────────────────────────
// menu:items          → Hash  { itemId → JSON }
// orders              → Hash  { orderId → JSON }
// orders:all          → Set   { orderId, ... }
// user:{email}:orders → Set   { orderId, ... }
// ─────────────────────────────────────────────────────────────────────────────

const store = {
  // ── Menu operations ───────────────────────────────────────────────────────
  menu: {
    async getAll() {
      const client = getClient();
      const hash = await client.hgetall('menu:items');
      if (!hash || Object.keys(hash).length === 0) return [];
      return Object.values(hash).map((v) => JSON.parse(v));
    },

    async getById(id) {
      const client = getClient();
      const raw = await client.hget('menu:items', id);
      return raw ? JSON.parse(raw) : null;
    },

    async getByCategory(category) {
      const items = await store.menu.getAll();
      return items.filter(
        (i) => i.category.toLowerCase() === category.toLowerCase()
      );
    },

    async getCategories() {
      const items = await store.menu.getAll();
      return [...new Set(items.map((i) => i.category))];
    },
  },

  // ── Order operations ──────────────────────────────────────────────────────
  orders: {
    async getAll() {
      const client = getClient();
      const ids = await client.smembers('orders:all');
      if (ids.length === 0) return [];
      const raws = await Promise.all(ids.map((id) => client.hget('orders', id)));
      return raws.filter(Boolean).map((r) => JSON.parse(r));
    },

    async getById(id) {
      const client = getClient();
      const raw = await client.hget('orders', id);
      return raw ? JSON.parse(raw) : null;
    },

    async getByUserEmail(email) {
      const client = getClient();
      const ids = await client.smembers(`user:${email}:orders`);
      if (ids.length === 0) return [];
      const raws = await Promise.all(ids.map((id) => client.hget('orders', id)));
      return raws.filter(Boolean).map((r) => JSON.parse(r));
    },

    async create(orderData) {
      const client = getClient();
      const order = {
        id: uuidv4(),
        ...orderData,
        status: 'Order Received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await client.hset('orders', order.id, JSON.stringify(order));
      await client.sadd('orders:all', order.id);

      if (order.userEmail) {
        await client.sadd(`user:${order.userEmail}:orders`, order.id);
      }

      return { ...order };
    },

    async updateStatus(id, status) {
      const client = getClient();
      const raw = await client.hget('orders', id);
      if (!raw) return null;

      const order = JSON.parse(raw);
      order.status = status;
      order.updatedAt = new Date().toISOString();
      await client.hset('orders', id, JSON.stringify(order));
      return { ...order };
    },

    async delete(id) {
      const client = getClient();
      const raw = await client.hget('orders', id);
      if (!raw) return false;

      const order = JSON.parse(raw);
      await client.hdel('orders', id);
      await client.srem('orders:all', id);
      if (order.userEmail) {
        await client.srem(`user:${order.userEmail}:orders`, id);
      }
      return true;
    },

    async clear() {
      const client = getClient();
      // Remove all user-specific order sets
      const ids = await client.smembers('orders:all');
      if (ids.length > 0) {
        for (const id of ids) {
          const raw = await client.hget('orders', id);
          if (raw) {
            const order = JSON.parse(raw);
            if (order.userEmail) {
              await client.srem(`user:${order.userEmail}:orders`, id);
            }
          }
        }
        await client.del('orders');
      }
      await client.del('orders:all');
    },
  },
};

module.exports = store;

