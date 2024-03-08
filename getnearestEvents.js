import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Venue from './venueModel.js';
import Event from './eventModel.js';
import logger from './logger.js';

const RESULTS_PER_PAGE = 10;

/**
 * Retrieves the venues near the provided longitude and latitude.
 * @param {number} long - The longitude of the location.
 * @param {number} lat - The latitude of the location.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of venue objects.
 */
export async function getVenues(long, lat) {
  return await Venue.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(long), parseFloat(lat)] },
        distanceField: 'dist.calculated',
        key: 'location',
        includeLocs: 'dist.location',
        spherical: true
      }
    }
  ]).exec();
}

/**
 * Retrieves the events that occur on the provided date.
 * @param {string|Date} date - The date of the events. Can be a string in ISO format or a Date object.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of event objects.
 */
async function getEvents(date) {
  const events = await Event.find({
    date: {
      $gte: startOfDay(date),
      $lte: endOfDay(date)
    }
  }).populate('venue_id');

  return events;
}

/**
 * Filters the events based on the provided date.
 * @param {Array<Object>} events - The array of event objects to filter.
 * @param {string|Date} date - The date to filter the events by. Can be a string in ISO format or a Date object.
 * @returns {Array<Object>} - The filtered array of event objects.
 */
export function filterEventsByDate(events, date) {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfDay(date) && eventDate <= endOfDay(date);
  });
}

/**
 * Sorts the events based on the distance from the venues.
 * @param {Array<Object>} events - The array of event objects to sort.
 * @param {Array<Object>} venueData - The array of venue objects with distance information.
 * @returns {Array<Object>} - The sorted array of event objects.
 */
export function sortEventsByDistance(events, venueData) {
  return events.sort((a, b) => {
    const venueA = venueData.find((venue) => venue._id.equals(a.venue_id._id));
    const venueB = venueData.find((venue) => venue._id.equals(b.venue_id._id));
    return venueA.dist.calculated - venueB.dist.calculated;
  });
}

/**
 * Retrieves the nearest events based on the provided longitude, latitude, date, and page number.
 * @param {Object} options - The options for retrieving the nearest events.
 * @param {number} options.long - The longitude of the location.
 * @param {number} options.lat - The latitude of the location.
 * @param {string|Date} options.date - The date of the events. Can be a string in ISO format or a Date object.
 * @param {number} [options.pageNumber=0] - The page number for pagination. Defaults to 0.
 * @returns {Promise<Object|null>} - A promise that resolves to the result object containing the requested events and the amount of results, or null if an error occurs.
 */
export async function getNearestEvents({ long, lat, date, pageNumber = 0 }) {
  try {
    const formattedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    logger.info(`Received request for ${long} ${lat}, ${formattedDate}, ${pageNumber}`);

    const venues = await getVenues(long, lat);
    const venueData = venues.map((venue) => ({ _id: venue._id, dist: venue.dist }));

    const events = await getEvents(formattedDate);

    const eventsToday = filterEventsByDate(events, formattedDate);
    const eventsSortedByDistance = sortEventsByDistance(eventsToday, venueData);

    const eventsWithDistance = eventsSortedByDistance.map((event) => {
      // const venue = venueData.find((venue) => venue._id.equals(event.venue_id));
      return {
        eventResult: event,
        dist: event.venue_id.dist
      };
    });

    const amountOfResults = eventsWithDistance.length;
    const maxPages = Math.floor(amountOfResults / RESULTS_PER_PAGE);

    const startPage = Math.min(pageNumber * RESULTS_PER_PAGE, amountOfResults);
    const pageNumberLimit = startPage + RESULTS_PER_PAGE;

    const result = {
      requestedEvents: eventsWithDistance.slice(startPage, pageNumberLimit),
      amountOfResults
    };

    logger.info(`Amount of results: ${amountOfResults}`);
    logger.info(`Max pages: ${maxPages}`);
    logger.info(`Result number at start of current page: ${startPage}`);
    logger.info(`Page number limit: ${pageNumberLimit}`);
    logger.info(result.requestedEvents.map((item) => item.eventResult.eventName));

    return result;
  } catch (error) {
    logger.error(`Error: ${error.message}, Stack: ${error.stack}`);
    return null;
  }
}

export default getNearestEvents;
