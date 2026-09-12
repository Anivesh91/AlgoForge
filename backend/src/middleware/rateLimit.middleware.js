const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

const createRateLimiter = (options) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return errorResponse(
        res,
        'RATE_LIMITED',
        options.message || 'Too many requests, please try again later.',
        429
      );
    },
    ...options,
  });
};

// Auth limiter: 25 attempts per 15 minutes per IP
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

// Generation limiter: 15 problem generations per 10 minutes per IP
const generateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'Problem generation rate limit reached. Please wait before generating another challenge.',
});

// Judge limiter: 40 runs/submits per minute per IP
const judgeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: 'Too many code execution requests. Please pause before running or submitting again.',
});

// AI Tutor limiter: 40 hints/chat requests per minute per IP
const tutorLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: 'AI tutor rate limit reached. Please wait a moment before sending another prompt.',
});

module.exports = {
  authLimiter,
  generateLimiter,
  judgeLimiter,
  tutorLimiter,
};
