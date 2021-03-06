import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import queryTopTen from './queryTopTen.js';
import queryTopTenToday from './queryTopTenToday.js';
import getNearestEvents from './getnearestEvents.js';
import 'dotenv/config';

async function routes(app) {
  app.post('/api/getTopTenToday', async (req, res) => {
    // logic
    const result = await queryTopTenToday(req.body);
    console.log(result.length);
    if (result.length === 0) {
      console.log('No Results');
    }
    res.send(JSON.stringify(result));
  });

  app.post('/api/getResults', async (req, res) => {
    try {
      // logic
      console.log(req.body);
      // req.body should contain: lat, long and date
      const result = await getNearestEvents(req.body);
      if (result.length === 0) {
        console.log('No Results');
      }
      res.send(JSON.stringify(result));
    } catch (error) {
      console.log(`getResults Error ${error}`);
      res.sendStatus(404);
    }
  });

  app.post('/api/getTopTen', async (req, res) => {
    // logic
    const result = await queryTopTen(req.body);
    console.log(result);
    res.send();
  });
}

async function main() {
  try {
    let connectionDataString = '';

    if (process.env.NODE_ENV === 'development') {
      connectionDataString = process.env.MONGODB_CONNECTION_STRING_DEV;
    } else if (process.env.NODE_ENV === 'production') {
      connectionDataString = process.env.MONGODB_CONNECTION_STRING_PROD;
    }

    await mongoose.connect(connectionDataString, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    console.log(db.readyState);
    db.on('connection', () => {
      console.log(`Connected!`);
    });
    db.on('connecting', () => {
      console.log(`Connecting!`);
    });
    db.on('error', () => {
      console.log(`Connection Error`);
    });

    const app = express();
    app.use(express.json());
    app.use(cors());

    const port = process.env.PORT || 8030;
    app.listen(port, () => console.log(`listening on port ${port}...`));
    routes(app);
  } catch (error) {
    console.log(`main error ${error}`);
  }
}

main();
