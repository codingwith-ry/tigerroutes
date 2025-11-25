// Middleware to require a valid JWT decoded by verifyJwtCookie
module.exports = function requireJwt(req, res, next) {
  try {
    // verifyJwtCookie attaches decoded token to req.user (contains `id`)
    if (req.user && (req.user.id || req.user.studentAccount_ID)) return next();
    return res.status(401).json({ success: false, error: 'Authentication required (tigerToken)' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
};
