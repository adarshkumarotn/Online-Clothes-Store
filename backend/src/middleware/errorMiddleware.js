// Middleware: reusable request/response processing for errorMiddleware concerns.

const logger = require('../utils/logger');

function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack
  });

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

module.exports = {
  notFound,
  errorHandler
};


