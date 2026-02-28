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

async function runMigrations() {
  await ensureProductNameUniquePerCategory();
}

module.exports = {
  runMigrations
};


