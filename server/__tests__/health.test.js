// Prevent the server from creating a real MySQL pool during tests by
// mocking `mysql2` before requiring the app. This avoids background
// connections that can outlive the Jest environment.
jest.mock('mysql2', () => ({
  createPool: () => ({
    // mimic minimal pool API used by server.js
    getConnection: (cb) => cb(null, { release: () => {} }),
    on: () => {}
  })
}));

const request = require('supertest');
const app = require('../server');

describe('Health endpoint', () => {
  test('GET /__health responds 200', async () => {
    const res = await request(app).get('/__health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
