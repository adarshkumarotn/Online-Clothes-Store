// Routes: connects categoryRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');
const { categoryValidator } = require('../validators/categoryValidators');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.post(
  '/',
  authenticateAdmin,
  categoryValidator,
  validateRequest,
  categoryController.createCategory
);
router.put(
  '/:id',
  authenticateAdmin,
  categoryValidator,
  validateRequest,
  categoryController.updateCategory
);
router.delete('/:id', authenticateAdmin, categoryController.deleteCategory);

module.exports = router;


