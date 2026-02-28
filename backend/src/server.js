// Server bootstrap: checks DB connectivity, runs startup migrations, then starts the HTTP server.

require('dotenv').config();
const app = require('./app');
const db = require('./config/db');
const logger = require('./utils/logger');
const { runMigrations } = require('./utils/dbMigrations');

const PORT = Number(process.env.PORT || 5000);

async function bootstrap() {
  try {
    await db.query('SELECT 1');
    logger.info('Database connection successful');
    await runMigrations();

    app.listen(PORT, () => {
      logger.info(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message
    });
    process.exit(1);
  }
}

bootstrap();


