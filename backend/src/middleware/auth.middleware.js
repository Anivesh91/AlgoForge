const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.algoforge_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'AUTH_REQUIRED', 'Authentication required to access this resource', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'algoforge_development_secret_key_2026_super_secure');

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return errorResponse(res, 'AUTH_REQUIRED', 'User session is invalid or user no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return errorResponse(res, 'AUTH_REQUIRED', 'Session expired or invalid token', 401);
    }
    return next(error);
  }
};

module.exports = {
  authenticate,
};
