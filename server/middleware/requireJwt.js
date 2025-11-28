const jwt = require('jsonwebtoken');

// Middleware to require a valid staff JWT provided in the HttpOnly `tigerStaffToken` cookie.
// Rejects when cookie missing, token invalid, or the decoded token does not contain an allowed staff role.
module.exports = function requireJwt(req, res, next) {
  try {
    const token = req.cookies && req.cookies.tigerStaffToken;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required (tigerStaffToken)' });
    }

    const secret = process.env.JWT_SECRET || 'greenP1ace';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired staff authentication token' });
    }

    // Require staffRole_ID in the token
    const roleId = decoded.staffRole_ID || decoded.staffRoleId || null;
    if (!roleId) {
      return res.status(403).json({ success: false, error: 'Forbidden: staff role required' });
    }

    // Allowed roles can be configured via env var (comma-separated).
    // Default permits both counselors (1) and supervisors (2) so admin UI works for both.
    const allowed = (process.env.ALLOWED_STAFF_ROLES || '1,2').split(',').map((v) => Number(v.trim())).filter(Boolean);
    if (!allowed.includes(Number(roleId))) {
      return res.status(403).json({ success: false, error: 'Forbidden: insufficient role' });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    console.error('requireJwt error:', err);
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
};
