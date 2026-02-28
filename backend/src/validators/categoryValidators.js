// Validator: request body/query validation rules used by categoryValidators endpoints.

const { body } = require('express-validator');

const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim().isLength({ max: 500 })
];

module.exports = {
  categoryValidator
};


