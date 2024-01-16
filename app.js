import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import getTopTenTodayRoute from './routes/getTopTenToday.js';
import getResultsRoute from './routes/getResults.js';
import getTopTenRoute from './routes/getTopTen.js';
import logger from './logger.js';

import errorHandler from './errorHandler.js';

const app = express();
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
);
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/v1', getTopTenTodayRoute);
app.use('/api/v1', getResultsRoute);
app.use('/api/v1', getTopTenRoute);

// Health check endpoint
app.get('/health', (req, res) => res.sendStatus(200));

// Error handling middleware
app.use(errorHandler);

export default app;
