const request = require('supertest');
const { setupTestEnv } = require('./helpers');

let app;

beforeAll(async () => {
  ({ app } = await setupTestEnv());
});

describe('Menu API', () => {
  // ── GET /api/menu ───────────────────────────────────────────────────────
  describe('GET /api/menu', () => {
    it('should return all menu items (no auth required)', async () => {
      const res = await request(app).get('/api/menu');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.count).toBe(res.body.data.length);
    });

    it('should return items with all required fields', async () => {
      const res = await request(app).get('/api/menu');
      const item = res.body.data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('image');
      expect(item).toHaveProperty('category');
    });

    it('should filter items by category', async () => {
      const res = await request(app).get('/api/menu?category=Pizza');
      expect(res.status).toBe(200);
      res.body.data.forEach((item) => {
        expect(item.category).toBe('Pizza');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const res = await request(app).get('/api/menu?category=Sushi');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should be case-insensitive for category filter', async () => {
      const res = await request(app).get('/api/menu?category=pizza');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ── GET /api/menu/categories ────────────────────────────────────────────
  describe('GET /api/menu/categories', () => {
    it('should return all categories', async () => {
      const res = await request(app).get('/api/menu/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return unique categories', async () => {
      const res = await request(app).get('/api/menu/categories');
      const unique = [...new Set(res.body.data)];
      expect(res.body.data.length).toBe(unique.length);
    });
  });

  // ── GET /api/menu/:id ──────────────────────────────────────────────────
  describe('GET /api/menu/:id', () => {
    it('should return a single menu item by ID', async () => {
      const res = await request(app).get('/api/menu/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('1');
    });

    it('should return 404 for non-existent menu item', async () => {
      const res = await request(app).get('/api/menu/999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Health check ──────────────────────────────────────────────────────
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── 404 catch-all ─────────────────────────────────────────────────────
  describe('404 Route', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/api/undefined-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
