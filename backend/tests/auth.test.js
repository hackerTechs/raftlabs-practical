const request = require('supertest');
const { setupTestEnv } = require('./helpers');

let app;

beforeAll(async () => {
  ({ app } = await setupTestEnv());
});

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should accept a valid email and return user info', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('user@test.com');
      expect(res.body.data.isAdmin).toBe(false);
      // No token should be returned
      expect(res.body.data.token).toBeUndefined();
    });

    it('should identify admin user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@mail.com' });

      expect(res.status).toBe(200);
      expect(res.body.data.isAdmin).toBe(true);
    });

    it('should trim and lowercase email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '  User@Test.COM  ' });

      expect(res.body.data.email).toBe('user@test.com');
    });

    it('should reject missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Email');
    });

    it('should reject empty email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid email');
    });

    it('should reject email without domain', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@' });

      expect(res.status).toBe(400);
    });
  });
});
