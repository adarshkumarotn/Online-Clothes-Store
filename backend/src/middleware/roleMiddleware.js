// Middleware: reusable request/response processing for roleMiddleware concerns.

function authorizeRoles(...roles) {
  return (req, res, next) => {
    const role = req.user?.role || req.admin?.role;
    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: role not allowed'
      });
    }
    return next();
  };
}

module.exports = {
  authorizeRoles
};


