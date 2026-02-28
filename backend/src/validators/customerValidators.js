// Validator: request body/query validation rules used by customerValidators endpoints.

const { body } = require('express-validator');

const updateCustomerStatusValidator = [
  body('isActive').isBoolean().withMessage('isActive must be boolean')
];

const addressValidator = [
  body('line1').trim().notEmpty().withMessage('line1 is required'),
  body('city').trim().notEmpty().withMessage('city is required'),
  body('state').trim().notEmpty().withMessage('state is required'),
  body('postalCode').trim().notEmpty().withMessage('postalCode is required'),
  body('country').optional().trim().isLength({ min: 2 }),
  body('isDefault').optional().isBoolean()
];

module.exports = {
  updateCustomerStatusValidator,
  addressValidator
};


