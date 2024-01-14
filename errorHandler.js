import logger from './logger.js';

export default function errorHandler(err, req, res, next) {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
}
