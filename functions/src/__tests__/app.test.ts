import request from 'supertest';
import app from '../app';

describe('Caption Proxy API', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/caption/providers', () => {
    it('should return available providers', async () => {
      const response = await request(app)
        .get('/api/caption/providers')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('providers');
      expect(Array.isArray(response.body.providers)).toBe(true);
    });
  });

  describe('GET /api/caption/health', () => {
    it('should return caption service health', async () => {
      const response = await request(app)
        .get('/api/caption/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('providers');
    });
  });

  describe('POST /api/caption/:provider', () => {
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/caption/openai')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('imageUrl is required');
    });

    it('should validate image URL format', async () => {
      const response = await request(app)
        .post('/api/caption/openai')
        .send({ imageUrl: 'not-a-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('valid URL');
    });

    it('should reject unknown provider', async () => {
      const response = await request(app)
        .post('/api/caption/unknown')
        .send({ imageUrl: 'https://example.com/image.jpg' })
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('Unknown provider');
    });
  });

  describe('POST /api/caption/batch', () => {
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/caption/batch')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('imageUrl is required');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('not found');
    });
  });
});