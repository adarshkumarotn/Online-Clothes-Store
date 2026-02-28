// Routes: connects reportRoutes API paths with validators, auth middleware, and controllers.

const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/sales-by-date', reportController.salesByDate);
router.get('/sales-by-category', reportController.salesByCategory);
router.get('/top-products', reportController.topProducts);
router.get('/low-stock', reportController.lowStock);
router.get('/customer-purchases', reportController.customerPurchases);

module.exports = router;


