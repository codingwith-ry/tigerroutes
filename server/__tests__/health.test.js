const request = require('supertest');
const app = require('../server');

describe('Health endpoint', () => {
  test('GET /__health responds 200', async () => {
    const res = await request(app).get('/__health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
