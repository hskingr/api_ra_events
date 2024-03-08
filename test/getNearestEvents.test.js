import { getNearestEvents, filterEventsByDate, sortEventsByDistance } from '../getnearestEvents.js';
import Venue from '../venueModel.js';
import Event from '../eventModel.js';

jest.mock('../venueModel.js');
jest.mock('../eventModel.js');

describe('getNearestEvents', () => {
  it('should return the nearest events', async () => {
    // Arrange
    const mockVenue = { _id: '1', location: { type: 'Point', coordinates: [0, 0] } };
    const mockEvent = { _id: '1', venue_id: '1', date: new Date(), eventName: 'Test Event' };
    Venue.aggregate.mockResolvedValueOnce([mockVenue]);
    Event.find.mockResolvedValueOnce([mockEvent]);

    const params = {
      long: '0',
      lat: '0',
      date: new Date().toISOString(),
      pageNumber: 0
    };

    // Act
    const result = await getNearestEvents(params);

    // Assert
    expect(result.requestedEvents[0].eventResult).toEqual(mockEvent);
    expect(result.requestedEvents[0].dist).toEqual({ calculated: 0 });
  });

  it('should filter events by date', () => {
    // Arrange
    const events = [{ date: new Date('2022-01-01') }, { date: new Date('2022-01-02') }, { date: new Date('2022-01-03') }];
    const date = new Date('2022-01-02');

    // Act
    const result = filterEventsByDate(events, date);

    // Assert
    expect(result).toEqual([{ date: new Date('2022-01-02') }]);
  });

  it('should sort events by distance', () => {
    // Arrange
    const events = [{ venue_id: '1' }, { venue_id: '2' }];
    const venueData = [
      { _id: '1', dist: { calculated: 10 } },
      { _id: '2', dist: { calculated: 5 } }
    ];

    // Act
    const result = sortEventsByDistance(events, venueData);

    // Assert
    expect(result).toEqual([{ venue_id: '2' }, { venue_id: '1' }]);
  });
});
