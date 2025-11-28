const express = require('express');
const requireJwt = require('./middleware/requireJwt');

module.exports = (db) => {
  const router = express.Router();
  // Protect admin logs endpoints with JWT requirement
  router.use(requireJwt);

  // GET /staff-logs
  // Query params: page (1-based), limit, q (general search), staff (staff name or id), date (YYYY-MM-DD), dateFrom, dateTo
  router.get('/staff-logs', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
      const offset = (page - 1) * limit;

      const q = (req.query.q || '').trim();
      const staff = (req.query.staff || '').trim();
      const date = (req.query.date || '').trim();
      const dateFrom = (req.query.dateFrom || '').trim();
      const dateTo = (req.query.dateTo || '').trim();

      const where = [];
      const params = [];

      if (q) {
        where.push('(sl.action LIKE ? OR COALESCE(sa.name, "") LIKE ?)');
        params.push(`%${q}%`, `%${q}%`);
      }

      if (staff) {
        // if numeric, allow matching by staffAccount_ID, otherwise match name
        if (/^\d+$/.test(staff)) {
          where.push('sl.staffAccount_ID = ?');
          params.push(Number(staff));
        } else {
          where.push('COALESCE(sa.name, "") LIKE ?');
          params.push(`%${staff}%`);
        }
      }

      if (date) {
        // exact date
        where.push('DATE(sl.date) = ?');
        params.push(date);
      } else if (dateFrom || dateTo) {
        if (dateFrom && dateTo) {
          where.push('DATE(sl.date) BETWEEN ? AND ?');
          params.push(dateFrom, dateTo);
        } else if (dateFrom) {
          where.push('DATE(sl.date) >= ?');
          params.push(dateFrom);
        } else if (dateTo) {
          where.push('DATE(sl.date) <= ?');
          params.push(dateTo);
        }
      }

      // Build count query
      let countSql = 'SELECT COUNT(*) AS total FROM tbl_stafflogs sl LEFT JOIN tbl_staffaccounts sa ON sl.staffAccount_ID = sa.staffAccount_ID';
      if (where.length) countSql += ' WHERE ' + where.join(' AND ');
      const [countRows] = await db.promise().query(countSql, params);
      const total = countRows && countRows[0] ? countRows[0].total : 0;

      // Build data query
      let dataSql = `
        SELECT
          sl.staffLogs_ID,
          sl.staffAccount_ID,
          COALESCE(sa.name, NULL) AS staffName,
          sl.action,
          sl.date
        FROM tbl_stafflogs sl
        LEFT JOIN tbl_staffaccounts sa ON sl.staffAccount_ID = sa.staffAccount_ID
      `;
      if (where.length) dataSql += ' WHERE ' + where.join(' AND ');
      dataSql += ' ORDER BY sl.date DESC LIMIT ? OFFSET ?';

      const dataParams = params.concat([limit, offset]);
      const [rows] = await db.promise().query(dataSql, dataParams);

        // Normalize date to ISO string in UTC
      const parseMySQLDateAsUTC = (val) => {
        if (!val) return null;
        if (val instanceof Date) return val; // already a Date (assumed correct)
        if (typeof val !== 'string') return new Date(val);
        // If looks like ISO already, let Date parse it
        if (val.includes('T') || val.endsWith('Z')) return new Date(val);
        // Expected format: YYYY-MM-DD HH:MM:SS
        const parts = val.split(/[- :]/).map((p) => parseInt(p, 10));
        // parts: [YYYY, MM, DD, HH, mm, SS]
        while (parts.length < 6) parts.push(0);
        return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
      };

      const normalized = (rows || []).map((r) => {
        const copy = Object.assign({}, r);
        if (copy.date) {
          try {
            const d = parseMySQLDateAsUTC(copy.date);
            copy.date = d instanceof Date && !isNaN(d) ? d.toISOString() : null;
          } catch (e) {
            copy.date = null;
          }
        }
        return copy;
      });

      return res.json({ success: true, data: normalized, total, page, limit });
    } catch (err) {
      console.error('Error fetching staff logs:', err);
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

  return router;
};
