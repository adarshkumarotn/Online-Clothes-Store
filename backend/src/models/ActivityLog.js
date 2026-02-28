// Model: contains SQL query functions used for ActivityLog data operations.

const db = require('../config/db');

async function create({ actorType, actorId, action, details }) {
  await db.query(
    `INSERT INTO activity_logs (actor_type, actor_id, action, details)
     VALUES (?, ?, ?, ?)`,
    [actorType, actorId || null, action, details || null]
  );
}

module.exports = {
  create
};


