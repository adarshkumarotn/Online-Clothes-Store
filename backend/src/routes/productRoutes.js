// Routes: connects productRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const productController = require('../controllers/productController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');
const {
  createProductValidator,
  updateStockValidator
} = require('../validators/productValidators');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  authenticateAdmin,
  createProductValidator,
  validateRequest,
  productController.createProduct
);

router.put(
  '/:id',
  authenticateAdmin,
  createProductValidator,
  validateRequest,
  productController.updateProduct
);

router.delete('/:id', authenticateAdmin, productController.deleteProduct);

router.patch(
  '/:id/stock',
  authenticateAdmin,
  updateStockValidator,
  validateRequest,
  productController.updateStock
);

module.exports = router;


