// Routes: connects cartRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');
const {
  addToCartValidator,
  updateCartItemValidator
} = require('../validators/cartValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', addToCartValidator, validateRequest, cartController.addToCart);
router.put(
  '/items/:productId',
  updateCartItemValidator,
  validateRequest,
  cartController.updateCartItem
);
router.delete('/items/:productId', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;


