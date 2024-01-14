import express from 'express';
import getNearestEvents from '../getnearestEvents.js';
import logger from '../logger.js';
import { check, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler'; // new import

const router = express.Router();

router.post(
  '/getResults',
  [check('lat').isFloat(), check('long').isFloat(), check('date').isISO8601(), check('pageNumber').isNumeric()],
  asyncHandler(async (req, res) => {
    // use asyncHandler
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    logger.info(`Request made to getResults`);
    logger.info(req.body);

    const { lat, long, date, pageNumber } = req.body;
    const result = await getNearestEvents({ lat, long, date, pageNumber: Number(pageNumber) });

    if (result.length === 0) {
      logger.info('No results');
      return res.status(404).json({ message: 'No results found' });
    }

    res.json(result);
  })
);

export default router;
