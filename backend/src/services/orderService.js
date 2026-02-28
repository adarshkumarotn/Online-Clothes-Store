// Service: contains business logic for orderService workflows.

const db = require('../config/db');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

async function placeOrder({ customerId, addressId }) {
  const cartData = await Cart.getCartItems(customerId);
  if (!cartData.items.length) {
    const error = new Error('Cart is empty');
    error.statusCode = 400;
    throw error;
  }

  for (const item of cartData.items) {
    if (item.quantity > item.stock) {
      const error = new Error(`Insufficient stock for ${item.name}`);
      error.statusCode = 400;
      throw error;
    }
  }

  const totalAmount = cartData.items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();

    const orderId = await Order.createOrder(connection, {
      customerId,
      addressId,
      totalAmount
    });

    for (const item of cartData.items) {
      await Order.addOrderItem(connection, {
        orderId,
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price
      });

      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.product_id, item.quantity]
      );

      await connection.execute(
        `INSERT INTO inventory_logs (product_id, change_type, quantity_changed, note)
         VALUES (?, 'remove', ?, ?)`,
        [
          item.product_id,
          item.quantity,
          `Order #${orderId} placed by customer #${customerId}`
        ]
      );
    }

    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartData.cartId]);

    await connection.execute(
      `INSERT INTO activity_logs (actor_type, actor_id, action, details)
       VALUES ('customer', ?, 'PLACE_ORDER', ?)`,
      [customerId, `Order #${orderId} placed`]
    );

    await connection.commit();
    return {
      orderId,
      totalAmount
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  placeOrder
};


