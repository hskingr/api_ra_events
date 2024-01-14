import express from 'express';
import queryTopTenToday from '../queryTopTenToday.js';
import logger from '../logger.js';

const router = express.Router();

router.post('/getTopTenToday', async (req, res) => {
  try {
    logger.info(`Request made to getTopTenToday`);

    const result = await queryTopTenToday(req.body);
    logger.info(result.length);

    if (result.length === 0) {
      logger.info('No results');
    }

    res.send(JSON.stringify(result));
  } catch (error) {
    logger.error(`Error in getTopTenToday: ${error}`);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
