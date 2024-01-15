import express from 'express';
import queryTopTen from '../queryTopTen.js';
import logger from '../logger.js';

const router = express.Router();

router.post('/getTopTen', async (req, res) => {
  try {
    logger.info(`Request made to getTopTen`);

    const result = await queryTopTen(req.body);
    logger.info(result);

    // Debugging result in production. Remove after testing.
    logger.info(result);

    res.send(result);
  } catch (error) {
    logger.error(`Error occurred in getTopTen: ${error}`);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
