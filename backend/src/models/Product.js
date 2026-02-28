// Model: contains SQL query functions used for Product data operations.

const db = require('../config/db');

async function create(data) {
  const result = await db.query(
    `INSERT INTO products
    (category_id, name, description, price, stock, image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.categoryId,
      data.name,
      data.description || null,
      data.price,
      data.stock,
      data.imageUrl || null,
      data.isActive === undefined ? 1 : Number(Boolean(data.isActive))
    ]
  );
  return result.insertId;
}

async function findById(id) {
  const rows = await db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findMany({ search, categoryId, page, limit, includeInactive }) {
  const filters = [];
  const params = [];

  if (search) {
    filters.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (categoryId) {
    filters.push('p.category_id = ?');
    params.push(categoryId);
  }

  if (!includeInactive) {
    filters.push('p.is_active = 1');
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const rows = await db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const countRows = await db.query(
    `SELECT COUNT(*) AS total
     FROM products p
     ${whereClause}`,
    params
  );

  return {
    items: rows,
    total: countRows[0]?.total || 0
  };
}

async function update(id, data) {
  await db.query(
    `UPDATE products
     SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_url = ?, is_active = ?
     WHERE id = ?`,
    [
      data.categoryId,
      data.name,
      data.description || null,
      data.price,
      data.stock,
      data.imageUrl || null,
      data.isActive === undefined ? 1 : Number(Boolean(data.isActive)),
      id
    ]
  );
}

async function remove(id) {
  await db.query('DELETE FROM products WHERE id = ?', [id]);
}

async function updateStock(id, stock) {
  await db.query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
}

module.exports = {
  create,
  findById,
  findMany,
  update,
  remove,
  updateStock
};


