import getNearestEvents from '../getnearestEvents.js';
import Event from '../eventModel';
import Venue from '../venueModel';

jest.mock('../eventModel');
jest.mock('../venueModel');

describe('getNearestEvents', () => {
  it('should return the nearest events', async () => {
    const mockEventResults = [{ venue_id: { name: 'Test Venue' } }];
    const mockVenueResults = [{ name: 'Test Venue', dist: { calculated: 1 } }];

    Event.find.mockResolvedValue(mockEventResults);
    Venue.aggregate.mockResolvedValue(mockVenueResults);

    const result = await getNearestEvents({ long: 1, lat: 1, date: '2022-01-01', pageNumber: 0 });

    expect(result).toEqual({
      requestedEvents: [
        {
          eventResult: mockEventResults[0],
          dist: mockVenueResults[0].dist
        }
      ],
      amountOfResults: 1
    });
  });

  it('should handle errors', async () => {
    const error = new Error('Test error');
    Event.find.mockRejectedValue(error);

    const result = await getNearestEvents({ long: 1, lat: 1, date: '2022-01-01', pageNumber: 0 });

    expect(result).toBeNull();
  });
});
