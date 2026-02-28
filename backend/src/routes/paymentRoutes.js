// Routes: connects paymentRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate, authenticateAdmin } = require('../middleware/authMiddleware');
const { createPaymentValidator } = require('../validators/paymentValidators');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/', authenticate, createPaymentValidator, validateRequest, paymentController.createPayment);
router.get('/my', authenticate, paymentController.getMyPayments);
router.get('/all', authenticateAdmin, paymentController.getAllPayments);

module.exports = router;


