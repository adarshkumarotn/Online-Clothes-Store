// Routes: connects adminAuthRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');
const { loginValidator } = require('../validators/authValidators');
const { validateRequest } = require('../middleware/validateMiddleware');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginValidator, validateRequest, adminAuthController.login);
router.get('/profile', authenticateAdmin, adminAuthController.profile);

module.exports = router;


