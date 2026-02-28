// Model: contains SQL query functions used for Category data operations.

const db = require('../config/db');

async function create({ name, description }) {
  const result = await db.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description || null]
  );
  return result.insertId;
}

async function getAll() {
  return db.query('SELECT * FROM categories ORDER BY name ASC');
}

async function findById(id) {
  const rows = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

async function update(id, { name, description }) {
  await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
    name,
    description || null,
    id
  ]);
}

async function remove(id) {
  await db.query('DELETE FROM categories WHERE id = ?', [id]);
}

module.exports = {
  create,
  getAll,
  findById,
  update,
  remove
};


