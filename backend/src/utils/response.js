/**
 * Consistent API response helper adhering to AlgoForge Blueprint specs:
 * Success: { success: true, data: ... }
 * Error:   { success: false, error: { code, message, details? } }
 */

const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const errorResponse = (res, code, message, statusCode = 400, details = undefined) => {
  const payload = {
    code,
    message,
  };
  if (details !== undefined) {
    payload.details = details;
  }
  return res.status(statusCode).json({
    success: false,
    error: payload,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
