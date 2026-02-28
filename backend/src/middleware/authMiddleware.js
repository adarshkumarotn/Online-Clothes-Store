// Middleware: reusable request/response processing for authMiddleware concerns.

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: token missing'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: invalid token'
    });
  }
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: token missing'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    req.admin = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: invalid admin token'
    });
  }
}

module.exports = {
  authenticate,
  authenticateAdmin
};


