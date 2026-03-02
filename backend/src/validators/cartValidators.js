// Validator: request body/query validation rules used by cartValidators endpoints.

const { body } = require('express-validator');

const addToCartValidator = [
  body('productId').isInt({ min: 1 }).withMessage('Valid product id required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('size').optional().isString().isLength({ max: 50 }).withMessage('Invalid size')
];

const updateCartItemValidator = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('size').optional().isString().isLength({ max: 50 }).withMessage('Invalid size')
];

module.exports = {
  addToCartValidator,
  updateCartItemValidator
};


