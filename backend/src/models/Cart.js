// Model: contains SQL query functions used for Cart data operations.

const db = require('../config/db');

async function getOrCreateCart(customerId) {
  const carts = await db.query('SELECT * FROM carts WHERE customer_id = ?', [customerId]);
  if (carts[0]) {
    return carts[0];
  }

  const result = await db.query('INSERT INTO carts (customer_id) VALUES (?)', [customerId]);
  const created = await db.query('SELECT * FROM carts WHERE id = ?', [result.insertId]);
  return created[0];
}

async function getCartItems(customerId) {
  const cart = await getOrCreateCart(customerId);
  const items = await db.query(
    `SELECT ci.product_id, ci.size, ci.quantity, ci.unit_price,
            p.name, p.image_url, p.stock,
            c.name AS category_name
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE ci.cart_id = ?`,
    [cart.id]
  );
  return {
    cartId: cart.id,
    items
  };
}

async function findCartItem(cartId, productId, size = '') {
  const rows = await db.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ?',
    [cartId, productId, size]
  );
  return rows[0] || null;
}

async function upsertCartItem(cartId, productId, size, quantity, unitPrice) {
  await db.query(
    `INSERT INTO cart_items (cart_id, product_id, size, quantity, unit_price)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), unit_price = VALUES(unit_price)`,
    [cartId, productId, size, quantity, unitPrice]
  );
}

async function removeCartItem(cartId, productId, size = '') {
  await db.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ?', [
    cartId,
    productId,
    size
  ]);
}

async function clearCart(cartId) {
  await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
}

module.exports = {
  getOrCreateCart,
  getCartItems,
  findCartItem,
  upsertCartItem,
  removeCartItem,
  clearCart
};


