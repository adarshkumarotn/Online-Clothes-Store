// Controller: handles API request/response flow for paymentController features.

const Payment = require('../models/Payment');
const Order = require('../models/Order');

function makeTransactionRef(orderId) {
  return `TXN-${orderId}-${Date.now()}`;
}

async function createPayment(req, res, next) {
  try {
    const { orderId, paymentMethod } = req.body;
    const order = await Order.getOrderById(orderId);

    if (!order || order.customer_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const existingPayment = await Payment.findByOrderId(orderId);
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Payment already exists for this order'
      });
    }

    const status = paymentMethod === 'cod' ? 'initiated' : 'completed';
    await Payment.create({
      orderId,
      paymentMethod,
      amount: order.total_amount,
      status,
      transactionRef: makeTransactionRef(orderId)
    });

    if (status === 'completed') {
      await Order.updateStatus(orderId, 'paid');
    }

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: await Payment.findByOrderId(orderId)
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyPayments(req, res, next) {
  try {
    const payments = await Payment.getCustomerPayments(req.user.id);
    return res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllPayments(req, res, next) {
  try {
    const payments = await Payment.getAllPayments();
    return res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPayment,
  getMyPayments,
  getAllPayments
};


