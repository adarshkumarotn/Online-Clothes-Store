// Service: contains business logic for reportService workflows.

const db = require('../config/db');

async function salesByDate(from, to) {
  return db.query(
    `SELECT DATE(created_at) AS sale_date, SUM(total_amount) AS total_sales, COUNT(*) AS total_orders
     FROM orders
     WHERE status IN ('paid', 'shipped', 'delivered')
       AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY sale_date ASC`,
    [from, to]
  );
}

async function salesByCategory(from, to) {
  return db.query(
    `SELECT c.id AS category_id, c.name AS category_name,
            SUM(oi.quantity * oi.unit_price) AS total_sales,
            SUM(oi.quantity) AS total_units
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE o.status IN ('paid', 'shipped', 'delivered')
       AND DATE(o.created_at) BETWEEN ? AND ?
     GROUP BY c.id, c.name
     ORDER BY total_sales DESC`,
    [from, to]
  );
}

async function topProducts(limit) {
  return db.query(
    `SELECT p.id AS product_id, p.name,
            SUM(oi.quantity) AS total_units,
            SUM(oi.quantity * oi.unit_price) AS total_sales
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status IN ('paid', 'shipped', 'delivered')
     GROUP BY p.id, p.name
     ORDER BY total_units DESC
     LIMIT ?`,
    [limit]
  );
}

async function lowStock(threshold) {
  const filters = [];
  const params = [];

  if (Number.isFinite(threshold)) {
    filters.push('p.stock <= ?');
    params.push(threshold);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  return db.query(
    `SELECT p.id, p.name, p.stock, c.name AS category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY p.stock ASC, p.name ASC`,
    params
  );
}

async function customerPurchases(from, to) {
  return db.query(
    `SELECT c.id AS customer_id,
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            c.email,
            COUNT(DISTINCT o.id) AS total_orders,
            COALESCE(SUM(o.total_amount), 0) AS total_spent
     FROM customers c
     LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status IN ('paid', 'shipped', 'delivered')
      AND DATE(o.created_at) BETWEEN ? AND ?
     GROUP BY c.id, c.first_name, c.last_name, c.email
     ORDER BY total_spent DESC`,
    [from, to]
  );
}

module.exports = {
  salesByDate,
  salesByCategory,
  topProducts,
  lowStock,
  customerPurchases
};


