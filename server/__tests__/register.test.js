// Mock mysql2 before requiring the app so the server picks up the mock pool
jest.mock('mysql2', () => ({
  createPool: () => ({
    // minimal pool interface used by server.js and loginRoutes
    getConnection: (cb) => cb(null, { release: () => {} }),
    on: () => {},
    // query as callback-style used by /register
    query: (sql, params, cb) => {
      if (typeof sql === 'string' && sql.toLowerCase().includes('select studentaccount_id from tbl_studentaccounts')) {
        const email = Array.isArray(params) ? String(params[0] || '').toLowerCase() : '';
        if (email.includes('existing@ust.edu.ph')) {
          return cb(null, [{ studentAccount_ID: 99 }]);
        }
        return cb(null, []);
      }
      // simulate INSERT into tbl_studentaccounts
      if (typeof sql === 'string' && sql.toLowerCase().includes('insert into tbl_studentaccounts')) {
        // simulate successful insert
        const result = { insertId: 1234 };
        return cb(null, result);
      }
      // default: no-op
      return cb(null, {});
    }
  })
}));

const request = require('supertest');
const app = require('../server');

describe('Registration domain restriction', () => {
  test('allows registration for ust.edu.ph emails', async () => {
    const payload = { name: 'Test User', email: 'student@ust.edu.ph', password: 'password123' };
    const res = await request(app).post('/api/register').send(payload).set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('id', 1234);
  });

  test('rejects registration for non-UST emails', async () => {
    const payload = { name: 'Other User', email: 'user@gmail.com', password: 'password123' };
    const res = await request(app).post('/api/register').send(payload).set('Accept', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/UST email/i);
  });

  test('rejects registration for existing emails', async () => {
    const payload = { name: 'Existing User', email: 'existing@ust.edu.ph', password: 'password123' };
    const res = await request(app).post('/api/register').send(payload).set('Accept', 'application/json');
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/already registered/i);
  });
});
