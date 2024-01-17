import request from 'supertest';
import app from '../app'; // Import your Express app
import connectDB, { disconnectDB } from '../db';

describe('Routes', () => {
  beforeAll(async () => {
    await connectDB();
  });

  it('POST /getResults responds with json', async () => {
    const response = await request(app)
      .post('/api/v1/getResults')
      .send({ long: -2.1887275, lat: 51.0114901, date: '2023-12-28T14:12:47.599Z', pageNumber: 0 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    // Add more assertions based on the response
  }, 10000); // Increase timeout to 10 seconds

  describe('GET /health', () => {
    it('responds with status 200', async () => {
      const response = await request(app).get('/health').query().expect(200);

      // Add more assertions if needed
    });
  });

  // Add more it() blocks for other routes

  afterAll(async () => {
    await disconnectDB();
  });
});
