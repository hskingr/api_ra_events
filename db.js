import mongoose from 'mongoose';
import logger from './logger.js';
import config from 'config';

export default async function connectDB() {
  let connectionDataString = '';

  if (process.env.NODE_ENV === 'development') {
    connectionDataString = config.get('MONGODB_CONNECTION_STRING_DEV');
  } else if (process.env.NODE_ENV === 'production') {
    connectionDataString = config.get('MONGODB_CONNECTION_STRING_PROD');
  }

  if (!connectionDataString) {
    logger.error('No MongoDB connection string. Set MONGODB_CONNECTION_STRING_DEV or MONGODB_CONNECTION_STRING_PROD environment variable.');
    process.exit(1);
  }

  try {
    await mongoose.connect(connectionDataString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const db = mongoose.connection;
    logger.info(`MongoDB connection state: ${db.readyState}`);

    if (db.readyState === 1) {
      logger.info(`Connected to MongoDB!`);
    }

    // Handle the process termination signals to close the MongoDB connection
    process.on('SIGINT', () => {
      db.close(() => {
        logger.info('MongoDB connection closed due to app termination');
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
}
