// Routes: connects customerRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const { authenticate, authenticateAdmin } = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController');
const { validateRequest } = require('../middleware/validateMiddleware');
const {
  updateCustomerStatusValidator,
  addressValidator
} = require('../validators/customerValidators');

const router = express.Router();

router.get('/me/addresses', authenticate, customerController.getMyAddresses);
router.post(
  '/me/addresses',
  authenticate,
  addressValidator,
  validateRequest,
  customerController.addAddress
);

router.get('/', authenticateAdmin, customerController.getCustomers);
router.get('/:id', authenticateAdmin, customerController.getCustomerById);
router.patch(
  '/:id/status',
  authenticateAdmin,
  updateCustomerStatusValidator,
  validateRequest,
  customerController.updateCustomerStatus
);

module.exports = router;


