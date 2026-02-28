// Model: contains SQL query functions used for Customer data operations.

const db = require('../config/db');

async function create(data) {
  const result = await db.query(
    `INSERT INTO customers
    (first_name, last_name, email, password_hash, phone)
    VALUES (?, ?, ?, ?, ?)`,
    [data.firstName, data.lastName, data.email, data.passwordHash, data.phone || null]
  );
  return result.insertId;
}

async function findByEmail(email) {
  const rows = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await db.query(
    `SELECT id, first_name, last_name, email, phone, is_active, created_at, updated_at
     FROM customers
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function getAll() {
  return db.query(
    `SELECT id, first_name, last_name, email, phone, is_active, created_at
     FROM customers
     ORDER BY created_at DESC`
  );
}

async function updateStatus(id, isActive) {
  await db.query('UPDATE customers SET is_active = ? WHERE id = ?', [isActive, id]);
}

module.exports = {
  create,
  findByEmail,
  findById,
  getAll,
  updateStatus
};


