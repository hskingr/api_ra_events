import config from 'config';
import app from './app.js';
import connectDB from './db.js';
import logger from './logger.js';

try {
  await connectDB();
  const port = config.get('PORT');
  const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));
} catch (error) {
  logger.error(`Main error ${error}`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Process terminated');
  });
});
