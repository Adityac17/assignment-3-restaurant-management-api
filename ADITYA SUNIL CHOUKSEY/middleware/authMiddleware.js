const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Verifies "Authorization: Bearer <token>" and attaches the payload to req.user.
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization header with Bearer token is required'));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new ApiError(401, 'Token is missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, username: decoded.username };
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    return next(new ApiError(401, message));
  }
};

module.exports = authMiddleware;
