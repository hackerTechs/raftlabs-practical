const request = require('supertest');
const { setupTestEnv, USER_EMAIL, ADMIN_EMAIL } = require('./helpers');
const orderService = require('../src/services/orderService');
const store = require('../src/db/store');

let app;

const validOrder = {
  items: [
    { menuItemId: '1', quantity: 2 },
    { menuItemId: '3', quantity: 1 },
  ],
  customer: {
    name: 'John Doe',
    address: '123 Main Street, Apt 4',
    phone: '+91 98765 43210',
  },
};

beforeAll(async () => {
  ({ app } = await setupTestEnv());
});

beforeEach(async () => {
  orderService.clearAllSimulations();
  await store.orders.clear();
});

afterAll(() => {
  orderService.clearAllSimulations();
});

describe('Admin API', () => {
  // ── Access control ────────────────────────────────────────────────────
  describe('Access Control', () => {
    it('should reject requests without email header', async () => {
      const res = await request(app).get('/api/admin/orders');
      expect(res.status).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('X-User-Email', USER_EMAIL);
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Admin');
    });

    it('should allow admin access', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('X-User-Email', ADMIN_EMAIL);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── GET /api/admin/orders ───────────────────────────────────────────────
  describe('GET /api/admin/orders', () => {
    it('should return all orders from all users', async () => {
      await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      await request(app)
        .post('/api/orders')
        .set('X-User-Email', 'other@test.com')
        .send(validOrder);

      const res = await request(app)
        .get('/api/admin/orders')
        .set('X-User-Email', ADMIN_EMAIL);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return empty array when no orders exist', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('X-User-Email', ADMIN_EMAIL);

      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });
  });

  // ── GET /api/admin/orders/:id ───────────────────────────────────────────
  describe('GET /api/admin/orders/:id', () => {
    it('should return any order regardless of owner', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const res = await request(app)
        .get(`/api/admin/orders/${createRes.body.data.id}`)
        .set('X-User-Email', ADMIN_EMAIL);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createRes.body.data.id);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/admin/orders/fake-id')
        .set('X-User-Email', ADMIN_EMAIL);

      expect(res.status).toBe(404);
    });
  });

  // ── PATCH /api/admin/orders/:id/status ──────────────────────────────────
  describe('PATCH /api/admin/orders/:id/status', () => {
    it('should update order status', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const res = await request(app)
        .patch(`/api/admin/orders/${createRes.body.data.id}/status`)
        .set('X-User-Email', ADMIN_EMAIL)
        .send({ status: 'Preparing' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Preparing');
    });

    it('should not allow reverting to a previous status', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const orderId = createRes.body.data.id;

      await request(app)
        .patch(`/api/admin/orders/${orderId}/status`)
        .set('X-User-Email', ADMIN_EMAIL)
        .send({ status: 'Preparing' });

      const res = await request(app)
        .patch(`/api/admin/orders/${orderId}/status`)
        .set('X-User-Email', ADMIN_EMAIL)
        .send({ status: 'Order Received' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('revert');
    });

    it('should reject invalid status', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const res = await request(app)
        .patch(`/api/admin/orders/${createRes.body.data.id}/status`)
        .set('X-User-Email', ADMIN_EMAIL)
        .send({ status: 'Flying' });

      expect(res.status).toBe(400);
    });

    it('should reject empty status', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const res = await request(app)
        .patch(`/api/admin/orders/${createRes.body.data.id}/status`)
        .set('X-User-Email', ADMIN_EMAIL)
        .send({ status: '' });

      expect(res.status).toBe(400);
    });

    it('should allow progressing through the full status flow', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const orderId = createRes.body.data.id;
      const statuses = ['Preparing', 'Out for Delivery', 'Delivered'];

      for (const status of statuses) {
        const res = await request(app)
          .patch(`/api/admin/orders/${orderId}/status`)
          .set('X-User-Email', ADMIN_EMAIL)
          .send({ status });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe(status);
      }
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .patch('/api/admin/orders/fake-id/status')
        .set('X-User-Email', ADMIN_EMAIL)
        .send({ status: 'Preparing' });

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /api/admin/orders/:id ────────────────────────────────────────
  describe('DELETE /api/admin/orders/:id', () => {
    it('should delete an order', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const orderId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/admin/orders/${orderId}`)
        .set('X-User-Email', ADMIN_EMAIL);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const getRes = await request(app)
        .get(`/api/admin/orders/${orderId}`)
        .set('X-User-Email', ADMIN_EMAIL);

      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent order', async () => {
      const res = await request(app)
        .delete('/api/admin/orders/fake-id')
        .set('X-User-Email', ADMIN_EMAIL);

      expect(res.status).toBe(404);
    });

    it('should not be accessible by regular users', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const res = await request(app)
        .delete(`/api/admin/orders/${createRes.body.data.id}`)
        .set('X-User-Email', USER_EMAIL);

      expect(res.status).toBe(403);
    });
  });
});
