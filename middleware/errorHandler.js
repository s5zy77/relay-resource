const { ApiError } = require('../utils/apiResponse');

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: { message: `Route not found: ${req.method} ${req.path}`, code: 'NOT_FOUND' },
    });
  }
  next();
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: { message: err.message, code: 'VALIDATION_ERROR' },
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { message: `Invalid value for ${err.path}`, code: 'INVALID_ID' },
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { message: 'Duplicate value violates a unique constraint', code: 'DUPLICATE' },
    });
  }

  console.error('[error]', err);
  return res.status(err.status || 500).json({
    success: false,
    error: { message: err.message || 'Internal server error', code: err.code || 'SERVER_ERROR' },
  });
}

module.exports = { notFoundHandler, errorHandler };
