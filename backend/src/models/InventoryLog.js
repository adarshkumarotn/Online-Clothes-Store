// Model: contains SQL query functions used for InventoryLog data operations.

const db = require('../config/db');

async function create({ productId, changeType, quantityChanged, note }) {
  await db.query(
    `INSERT INTO inventory_logs (product_id, change_type, quantity_changed, note)
     VALUES (?, ?, ?, ?)`,
    [productId, changeType, quantityChanged, note || null]
  );
}

module.exports = {
  create
};


