// Validator: request body/query validation rules used by orderValidators endpoints.

const { body } = require('express-validator');

const placeOrderValidator = [
  body('addressId').optional().isInt({ min: 1 }),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
];

const updateOrderStatusValidator = [
  body('status')
    .isIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

module.exports = {
  placeOrderValidator,
  updateOrderStatusValidator
};


