const jwt = require('jsonwebtoken');

// Middleware that requires either a valid student JWT (`tigerToken`) or
// a valid staff JWT (`tigerStaffToken`). Attaches decoded payload to
// `req.user` and sets `req.user.isStaffToken` to true for staff tokens.
module.exports = function requireAnyJwt(req, res, next) {
  try {
    const staffToken = req.cookies && req.cookies.tigerStaffToken;
    const userToken = req.cookies && req.cookies.tigerToken;

    if (!staffToken && !userToken) {
      return res.status(401).json({ success: false, error: 'Authentication required (tigerToken or tigerStaffToken)' });
    }

    const secret = process.env.JWT_SECRET || 'greenP1ace';

    // Prefer staff token when present
    if (staffToken) {
      try {
        const decoded = jwt.verify(staffToken, secret);
        req.user = decoded;
        req.user.isStaffToken = true;
        return next();
      } catch (err) {
        // fallthrough to try user token
      }
    }

    if (userToken) {
      try {
        const decoded = jwt.verify(userToken, secret);
        req.user = decoded;
        req.user.isStaffToken = false;
        return next();
      } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
      }
    }

    return res.status(401).json({ success: false, error: 'Authentication required' });
  } catch (err) {
    console.error('requireAnyJwt error:', err);
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
};
