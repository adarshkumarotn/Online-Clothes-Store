// Validator: request body/query validation rules used by paymentValidators endpoints.

const { body } = require('express-validator');

const createPaymentValidator = [
  body('orderId').isInt({ min: 1 }).withMessage('Valid order id is required'),
  body('paymentMethod')
    .isIn(['cod', 'card', 'upi', 'netbanking'])
    .withMessage('Invalid payment method')
];

module.exports = {
  createPaymentValidator
};


