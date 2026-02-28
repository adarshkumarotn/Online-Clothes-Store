// Model: contains SQL query functions used for Admin data operations.

const db = require('../config/db');

async function findByEmail(email) {
  const rows = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await db.query(
    'SELECT id, name, email, created_at FROM admins WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  findByEmail,
  findById
};


