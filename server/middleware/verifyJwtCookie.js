const jwt = require('jsonwebtoken');

// Middleware to read `tigerToken` HttpOnly cookie and attach decoded payload to `req.user`.
// Non-fatal: if cookie missing/invalid, simply continue without error.
module.exports = function verifyJwtCookie(req, res, next) {
  try {
    const token = req.cookies && req.cookies.tigerToken;
    if (!token) return next();
    const secret = process.env.JWT_SECRET || 'greenP1ace';
    const decoded = jwt.verify(token, secret);
    // Attach minimal user info for downstream handlers
    req.user = decoded;
  } catch (err) {
    // invalid or expired token -> ignore (allow routes to respond 401 if needed)
  }
  return next();
};
