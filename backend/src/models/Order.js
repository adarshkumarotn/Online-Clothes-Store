// Model: contains SQL query functions used for Order data operations.

const db = require('../config/db');

async function createOrder(connection, { customerId, addressId, totalAmount }) {
  const [result] = await connection.execute(
    `INSERT INTO orders (customer_id, address_id, total_amount, status)
     VALUES (?, ?, ?, 'pending')`,
    [customerId, addressId || null, totalAmount]
  );
  return result.insertId;
}

async function addOrderItem(connection, { orderId, productId, quantity, unitPrice }) {
  await connection.execute(
    `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
     VALUES (?, ?, ?, ?)`,
    [orderId, productId, quantity, unitPrice]
  );
}

async function getCustomerOrders(customerId) {
  return db.query(
    `SELECT o.*
     FROM orders o
     WHERE o.customer_id = ?
     ORDER BY o.created_at DESC`,
    [customerId]
  );
}

async function getAllOrders() {
  return db.query(
    `SELECT o.*, c.first_name, c.last_name, c.email, c.phone,
            a.line1 AS address_line1,
            a.line2 AS address_line2,
            a.city AS address_city,
            a.state AS address_state,
            a.postal_code AS address_postal_code,
            a.country AS address_country
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      LEFT JOIN addresses a ON a.id = o.address_id
      ORDER BY o.created_at DESC`
  );
}

async function getOrderById(id) {
  const rows = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getOrderItems(orderId) {
  return db.query(
    `SELECT oi.*, p.name AS product_name, p.image_url, c.name AS category_name
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE oi.order_id = ?`,
    [orderId]
  );
}

async function updateStatus(orderId, status) {
  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
}

module.exports = {
  createOrder,
  addOrderItem,
  getCustomerOrders,
  getAllOrders,
  getOrderById,
  getOrderItems,
  updateStatus
};


