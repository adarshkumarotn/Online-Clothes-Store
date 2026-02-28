// Routes: connects orderRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, authenticateAdmin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');
const {
  placeOrderValidator,
  updateOrderStatusValidator
} = require('../validators/orderValidators');

const router = express.Router();

router.post('/', authenticate, placeOrderValidator, validateRequest, orderController.placeOrder);
router.get('/my', authenticate, orderController.getMyOrders);
router.get('/all', authenticateAdmin, orderController.getAllOrders);
router.get('/admin/:id', authenticateAdmin, orderController.getOrderDetails);
router.patch(
  '/:id/status',
  authenticateAdmin,
  updateOrderStatusValidator,
  validateRequest,
  orderController.updateOrderStatus
);
router.get('/:id', authenticate, orderController.getOrderDetails);

module.exports = router;


