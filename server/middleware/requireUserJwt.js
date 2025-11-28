const jwt = require('jsonwebtoken');

// Middleware to require a valid student JWT provided in the HttpOnly `tigerToken` cookie.
// Rejects when cookie missing or token invalid.
module.exports = function requireUserJwt(req, res, next) {
  try {
    const token = req.cookies && req.cookies.tigerToken;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required (tigerToken)' });
    }

    const secret = process.env.JWT_SECRET || 'greenP1ace';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    }

    req.user = decoded;
    req.user.isStaffToken = false;
    return next();
  } catch (err) {
    console.error('requireUserJwt error:', err);
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
};