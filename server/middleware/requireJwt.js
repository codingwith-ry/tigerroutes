const jwt = require('jsonwebtoken');

// Middleware to require a valid staff JWT provided in the HttpOnly `tigerStaffToken` cookie.
// Rejects when cookie missing, token invalid, or the decoded token does not contain an allowed staff role.
module.exports = function requireJwt(req, res, next) {
  try {
    // If a previous middleware (verifyJwtCookie) has already decoded a staff token,
    // trust that `req.user` instead of re-verifying the cookie. This avoids cases
    // where cookie parsing/ordering causes duplicate verification failures.
    if (req.user && req.user.isStaffToken) {
      const roleId = req.user.staffRole_ID || req.user.staffRoleId || null;
      if (!roleId) return res.status(403).json({ success: false, error: 'Forbidden: staff role required' });
      const allowed = (process.env.ALLOWED_STAFF_ROLES || '1,2').split(',').map((v) => Number(v.trim())).filter(Boolean);
      if (!allowed.includes(Number(roleId))) return res.status(403).json({ success: false, error: 'Forbidden: insufficient role' });
      return next();
    }

    // Fallback: directly verify the tigerStaffToken cookie if req.user was not set
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

    const roleId = decoded.staffRole_ID || decoded.staffRoleId || null;
    if (!roleId) {
      return res.status(403).json({ success: false, error: 'Forbidden: staff role required' });
    }

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
