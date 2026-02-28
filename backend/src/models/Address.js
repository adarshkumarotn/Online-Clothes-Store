// Model: contains SQL query functions used for Address data operations.

const db = require('../config/db');

async function getCustomerAddresses(customerId) {
  return db.query(
    `SELECT *
     FROM addresses
     WHERE customer_id = ?
     ORDER BY is_default DESC, created_at DESC`,
    [customerId]
  );
}

async function createAddress(customerId, data) {
  const result = await db.query(
    `INSERT INTO addresses
    (customer_id, line1, line2, city, state, postal_code, country, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customerId,
      data.line1,
      data.line2 || null,
      data.city,
      data.state,
      data.postalCode,
      data.country || 'India',
      Number(Boolean(data.isDefault))
    ]
  );
  return result.insertId;
}

async function findById(id) {
  const rows = await db.query('SELECT * FROM addresses WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = {
  getCustomerAddresses,
  createAddress,
  findById
};


