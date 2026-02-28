// Controller: handles API request/response flow for orderController features.

const Order = require('../models/Order');
const orderService = require('../services/orderService');

async function placeOrder(req, res, next) {
  try {
    const { addressId } = req.body;
    const result = await orderService.placeOrder({
      customerId: req.user.id,
      addressId
    });

    const order = await Order.getOrderById(result.orderId);
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.getCustomerOrders(req.user.id);
    const enriched = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await Order.getOrderItems(order.id)
      }))
    );
    return res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.getAllOrders();
    const enriched = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await Order.getOrderItems(order.id)
      }))
    );
    return res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    return next(error);
  }
}

async function getOrderDetails(req, res, next) {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isOwner = req.user && req.user.id === order.customer_id;
    const isAdmin = req.admin && req.admin.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    return res.json({
      success: true,
      data: {
        ...order,
        items: await Order.getOrderItems(order.id)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.updateStatus(req.params.id, req.body.status);
    return res.json({
      success: true,
      message: 'Order status updated',
      data: await Order.getOrderById(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus
};


