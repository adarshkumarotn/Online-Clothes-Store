// Routes: connects index API paths with validators, auth middleware, and controllers.

const express = require('express');
const authRoutes = require('./authRoutes');
const adminAuthRoutes = require('./adminAuthRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const reportRoutes = require('./reportRoutes');
const customerRoutes = require('./customerRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running'
  });
});

router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/customers', customerRoutes);

module.exports = router;


