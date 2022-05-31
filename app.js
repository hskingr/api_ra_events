import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import queryTopTen from './queryTopTen.js';
import queryTopTenToday from './queryTopTenToday.js';
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
  res.send(JSON.stringify(result));
  // res.send(`OK`);
});

app.post('/api/getTopTen', (req, res) => {
  //logic
  res.send(queryTopTen(req.body));
  res.send(`OK`);
});

const port = process.env.PORT || 8030;
app.listen(port, () => console.log(`listening on port ${port}...`));
