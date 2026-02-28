// Model: contains SQL query functions used for Payment data operations.

const db = require('../config/db');

async function create({ orderId, paymentMethod, amount, status, transactionRef }) {
  const result = await db.query(
    `INSERT INTO payments (order_id, payment_method, amount, status, transaction_ref)
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, paymentMethod, amount, status, transactionRef]
  );
  return result.insertId;
}

async function findByOrderId(orderId) {
  const rows = await db.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
  return rows[0] || null;
}

async function getCustomerPayments(customerId) {
  return db.query(
    `SELECT p.*, o.customer_id
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     WHERE o.customer_id = ?
     ORDER BY p.created_at DESC`,
    [customerId]
  );
}

async function getAllPayments() {
  return db.query(
    `SELECT p.*, o.customer_id, c.email
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN customers c ON c.id = o.customer_id
     ORDER BY p.created_at DESC`
  );
}

module.exports = {
  create,
  findByOrderId,
  getCustomerPayments,
  getAllPayments
};


