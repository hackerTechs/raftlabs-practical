const request = require('supertest');
const { setupTestEnv, USER_EMAIL } = require('./helpers');
const orderService = require('../src/services/orderService');
const store = require('../src/db/store');

let app;

const VALID_PHONE = '+91 98765 43210';

const validOrder = {
  items: [
    { menuItemId: '1', quantity: 2 },
    { menuItemId: '3', quantity: 1 },
  ],
  customer: {
    name: 'John Doe',
    address: '123 Main Street, Apt 4',
    phone: VALID_PHONE,
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

describe('Order API (Authenticated User)', () => {
  // ── Auth enforcement ──────────────────────────────────────────────────
  describe('Authentication via X-User-Email header', () => {
    it('should reject requests without email header', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('email');
    });

    it('should reject requests with invalid email', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('X-User-Email', 'not-an-email');
      expect(res.status).toBe(401);
    });

    it('should reject requests with empty email', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('X-User-Email', '');
      expect(res.status).toBe(401);
    });

    it('should accept valid email header', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('X-User-Email', USER_EMAIL);
      expect(res.status).toBe(200);
    });
  });

  // ── POST /api/orders ────────────────────────────────────────────────────
  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('Order Received');
      expect(res.body.data.userEmail).toBe(USER_EMAIL);
      expect(res.body.data.totalAmount).toBeGreaterThan(0);
    });

    it('should compute correct total amount', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 2 }],
          customer: validOrder.customer,
        });

      expect(res.body.data.totalAmount).toBe(25.98);
    });

    it('should include resolved item names and prices', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const item = res.body.data.items[0];
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('lineTotal');
    });

    it('should trim and sanitise customer fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1 }],
          customer: {
            name: '  Jane Smith  ',
            address: '  456 Oak Ave  ',
            phone: '  +91 98765 43210  ',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.customer.name).toBe('Jane Smith');
      expect(res.body.data.customer.address).toBe('456 Oak Ave');
      expect(res.body.data.customer.phone).toBe('+91 98765 43210');
    });

    // ── Items validation ────────────────────────────────────────────────
    it('should reject if items is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({ customer: validOrder.customer });
      expect(res.status).toBe(400);
    });

    it('should reject if items is empty', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({ items: [], customer: validOrder.customer });
      expect(res.status).toBe(400);
    });

    it('should reject if menuItemId is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({ items: [{ quantity: 1 }], customer: validOrder.customer });
      expect(res.status).toBe(400);
    });

    it('should reject if quantity is zero', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 0 }],
          customer: validOrder.customer,
        });
      expect(res.status).toBe(400);
    });

    it('should reject if quantity exceeds 99', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 100 }],
          customer: validOrder.customer,
        });
      expect(res.status).toBe(400);
    });

    it('should reject if menu item does not exist', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '999', quantity: 1 }],
          customer: validOrder.customer,
        });
      expect(res.status).toBe(400);
    });

    // ── Customer validation ─────────────────────────────────────────────
    it('should reject if customer is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({ items: [{ menuItemId: '1', quantity: 1 }] });
      expect(res.status).toBe(400);
    });

    it('should reject if customer name is too short', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1 }],
          customer: { name: 'A', address: '123 Street', phone: VALID_PHONE },
        });
      expect(res.status).toBe(400);
    });

    // ── Phone format validation (+91 XXXXX XXXXX) ───────────────────────
    it('should reject phone with too few digits', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1 }],
          customer: { name: 'John', address: '123 Main Street', phone: '123' },
        });
      expect(res.status).toBe(400);
    });

    it('should reject phone not in +91 XXXXX XXXXX format', async () => {
      const invalidPhones = [
        '1234567890',          // plain digits, wrong country code after sanitise
        '+1 234 567 8901',     // US number
        '(234) 567-8901',      // parenthesised US
        '+91 98765',           // too short
        '+91 01234 56789',     // starts with 0 (invalid local digit)
        '+91 51234 56789',     // starts with 5 (invalid local digit)
        '+44 98765 43210',     // wrong country code
      ];

      for (const phone of invalidPhones) {
        const res = await request(app)
          .post('/api/orders')
          .set('X-User-Email', USER_EMAIL)
          .send({
            items: [{ menuItemId: '1', quantity: 1 }],
            customer: { name: 'John', address: '123 Main Street', phone },
          });
        expect(res.status).toBe(400);
      }
    });

    it('should accept phone in correct +91 XXXXX XXXXX format', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1 }],
          customer: { name: 'John', address: '123 Main Street', phone: '+91 61234 56789' },
        });
      expect(res.status).toBe(201);
      expect(res.body.data.customer.phone).toBe('+91 61234 56789');
    });

    it('should sanitise raw digits into +91 XXXXX XXXXX format', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1 }],
          customer: { name: 'John', address: '123 Main Street', phone: '919876543210' },
        });
      expect(res.status).toBe(201);
      expect(res.body.data.customer.phone).toBe('+91 98765 43210');
    });

    // ── Sanitisation ─────────────────────────────────────────────────────
    it('should strip HTML tags from customer name', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1 }],
          customer: {
            name: '<script>alert("xss")</script>John Doe',
            address: '123 Main Street',
            phone: VALID_PHONE,
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.customer.name).toBe('alert("xss")John Doe');
      expect(res.body.data.customer.name).not.toContain('<script>');
    });

    it('should strip HTML tags from address', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1 }],
          customer: {
            name: 'John Doe',
            address: '<b>123 Main</b> Street',
            phone: VALID_PHONE,
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.customer.address).toBe('123 Main Street');
    });

    it('should whitelist only expected fields in the body', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '1', quantity: 1, extraField: 'hack' }],
          customer: {
            name: 'John',
            address: '123 Main Street',
            phone: VALID_PHONE,
            ssn: '123-45-6789',
          },
          malicious: 'payload',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.items[0]).not.toHaveProperty('extraField');
      expect(res.body.data.customer).not.toHaveProperty('ssn');
    });

    it('should reject menuItemId with invalid characters', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({
          items: [{ menuItemId: '<script>1</script>', quantity: 1 }],
          customer: validOrder.customer,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('invalid characters');
    });

    it('should reject more than 50 line items', async () => {
      const items = Array.from({ length: 51 }, () => ({ menuItemId: '1', quantity: 1 }));
      const res = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send({ items, customer: validOrder.customer });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('50');
    });
  });

  // ── GET /api/orders ─────────────────────────────────────────────────────
  describe('GET /api/orders', () => {
    it('should return empty array when no orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('X-User-Email', USER_EMAIL);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return only the authenticated users orders', async () => {
      await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      await request(app)
        .post('/api/orders')
        .set('X-User-Email', 'other@test.com')
        .send(validOrder);

      const res = await request(app)
        .get('/api/orders')
        .set('X-User-Email', USER_EMAIL);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].userEmail).toBe(USER_EMAIL);
    });
  });

  // ── GET /api/orders/:id ─────────────────────────────────────────────────
  describe('GET /api/orders/:id', () => {
    it('should return the users own order', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const res = await request(app)
        .get(`/api/orders/${createRes.body.data.id}`)
        .set('X-User-Email', USER_EMAIL);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createRes.body.data.id);
    });

    it('should return 404 for another users order', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('X-User-Email', USER_EMAIL)
        .send(validOrder);

      const res = await request(app)
        .get(`/api/orders/${createRes.body.data.id}`)
        .set('X-User-Email', 'other@test.com');

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/non-existent-id')
        .set('X-User-Email', USER_EMAIL);

      expect(res.status).toBe(404);
    });
  });
});
