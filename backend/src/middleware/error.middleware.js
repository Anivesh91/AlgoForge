const { ZodError } = require('zod');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]', err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'VALIDATION_ERROR', 'Input validation failed', 400, details);
  }

  // Handle JSON Syntax Errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'VALIDATION_ERROR', 'Malformed JSON payload', 400);
  }

  // Known custom errors with code and status
  if (err.code && err.statusCode) {
    return errorResponse(res, err.code, err.message, err.statusCode, err.details);
  }

  // Generic internal server error
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal error occurred' 
    : err.message || 'Internal Server Error';

  return errorResponse(res, 'INTERNAL_ERROR', message, 500);
};

const notFoundHandler = (req, res) => {
  return errorResponse(res, 'NOT_FOUND', `Route ${req.originalUrl} not found`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
