const jwt = require('jsonwebtoken');

// Middleware to read `tigerStaffToken` (staff) or `tigerToken` (student) HttpOnly cookie
// and attach decoded payload to `req.user`. Non-fatal: if no valid cookie is present,
// this middleware will not error but downstream routes that require authentication
// should enforce it explicitly.
module.exports = function verifyJwtCookie(req, res, next) {
  try {
    const staffToken = req.cookies && req.cookies.tigerStaffToken;
    const userToken = req.cookies && req.cookies.tigerToken;
    const secret = process.env.JWT_SECRET || 'greenP1ace';

    // Prefer staff token when both are present
    if (staffToken) {
      try {
        const decoded = jwt.verify(staffToken, secret);
        req.user = decoded;
        req.user.isStaffToken = true;
        return next();
      } catch (err) {
        // invalid staff token -> fallthrough to try user token
      }
    }

    if (userToken) {
      try {
        const decoded = jwt.verify(userToken, secret);
        req.user = decoded;
        req.user.isStaffToken = false;
      } catch (err) {
        // invalid user token -> ignore
      }
    }
  } catch (err) {
    // ignore errors; downstream routes should require authentication explicitly
  }
  return next();
};
