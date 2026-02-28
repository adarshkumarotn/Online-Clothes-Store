// Validator: request body/query validation rules used by productValidators endpoints.

const { body } = require('express-validator');

const createProductValidator = [
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category id required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
  body('description').optional().trim(),
  body('imageBase64')
    .optional({ checkFalsy: true })
    .custom((value) => /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value)))
    .withMessage('imageBase64 must be a valid base64 image payload')
];

const updateStockValidator = [
  body('quantity').isInt().withMessage('Quantity must be integer'),
  body('changeType')
    .isIn(['add', 'remove', 'adjust'])
    .withMessage('changeType must be add/remove/adjust')
];

module.exports = {
  createProductValidator,
  updateStockValidator
};


