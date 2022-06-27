import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import queryTopTen from './queryTopTen.js';
import queryTopTenToday from './queryTopTenToday.js';
import getNearestEvents from './getnearestEvents.js';
import 'dotenv/config';

let connectionDataString = '';

if (process.env.NODE_ENV === 'development') {
  connectionDataString = process.env.MONGODB_CONNECTION_STRING_DEV;
} else if (process.env.NODE_ENV === 'production') {
  connectionDataString = process.env.MONGODB_CONNECTION_STRING_PROD;
}

mongoose.connect(connectionDataString);
mongoose.connection.on('connected', () => {
  console.log('Connected To Database');
});
const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/getTopTenToday', async (req, res) => {
  //logic
  const result = await queryTopTenToday(req.body);
  console.log(result.length);
  if (result.length === 0) {
    console.log('No Results');
  }
  res.send(JSON.stringify(result));
});

app.post('/api/getResults', async (req, res) => {
  // logic
  console.log(req.body);
  // req.body should contain: lat, long and date
  const result = await getNearestEvents(req.body);
  if (result.length === 0) {
    console.log('No Results');
  }
  res.send(JSON.stringify(result));
});

app.post('/api/getTopTen', async (req, res) => {
  //logic
  const result = await queryTopTen(req.body);
  console.log(result);
  res.send();
});

const port = process.env.PORT || 8030;
app.listen(port, () => console.log(`listening on port ${port}...`));
