// Utility: runs lightweight DB index migrations on server startup.

const db = require('../config/db');
const logger = require('./logger');

async function hasIndex(tableName, indexName) {
  const rows = await db.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND index_name = ?`,
    [tableName, indexName]
  );
  return Number(rows[0]?.total || 0) > 0;
}

async function hasColumn(tableName, columnName) {
  const rows = await db.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?`,
    [tableName, columnName]
  );
  return Number(rows[0]?.total || 0) > 0;
}

async function ensureProductNameUniquePerCategory() {
  const hasOldIndex = await hasIndex('products', 'uniq_product_name');
  if (hasOldIndex) {
    await db.query('ALTER TABLE products DROP INDEX uniq_product_name');
    logger.info('Dropped legacy unique index uniq_product_name');
  }

  const hasScopedIndex = await hasIndex('products', 'uniq_product_category_name');
  if (!hasScopedIndex) {
    await db.query(
      'ALTER TABLE products ADD UNIQUE INDEX uniq_product_category_name (category_id, name)'
    );
    logger.info('Created unique index uniq_product_category_name');
  }
}

async function ensureCartItemSizeSupport() {
  const hasSizeColumn = await hasColumn('cart_items', 'size');
  if (!hasSizeColumn) {
    await db.query("ALTER TABLE cart_items ADD COLUMN size VARCHAR(50) NOT NULL DEFAULT ''");
    logger.info('Added cart_items.size column');
  } else {
    await db.query("UPDATE cart_items SET size = '' WHERE size IS NULL");
  }

  const hasScopedIndex = await hasIndex('cart_items', 'uniq_cart_product_size');
  if (!hasScopedIndex) {
    await db.query(
      'ALTER TABLE cart_items ADD UNIQUE INDEX uniq_cart_product_size (cart_id, product_id, size)'
    );
    logger.info('Created unique index uniq_cart_product_size');
  }

  const hasLegacyIndex = await hasIndex('cart_items', 'uniq_cart_product');
  if (hasLegacyIndex) {
    try {
      await db.query('ALTER TABLE cart_items DROP INDEX uniq_cart_product');
      logger.info('Dropped legacy unique index uniq_cart_product');
    } catch (error) {
      logger.info('Keeping legacy unique index uniq_cart_product', {
        reason: error.message
      });
    }
  }
}

async function runMigrations() {
  await ensureProductNameUniquePerCategory();
  await ensureCartItemSizeSupport();
}

module.exports = {
  runMigrations
};


