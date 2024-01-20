import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Venue from './venueModel.js';
import Event from './eventModel.js';
import logger from './logger.js';

const RESULTS_PER_PAGE = 10;

async function getNearestEvents({ long, lat, date, pageNumber = 0 }) {
  try {
    const theDate = new Date(date);
    logger.info(`Received request for ${long} ${lat}, ${theDate}, ${pageNumber}`);

    const formattedDate = typeof theDate === 'string' ? parseISO(theDate) : theDate;
    logger.info(`Formatted date: ${formattedDate}`);
    logger.info(`Start of day: ${startOfDay(formattedDate)}, end of day: ${endOfDay(formattedDate)}`);

    const venues = await Venue.aggregate([
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

    const venueData = venues.map((venue) => ({ _id: venue._id, dist: venue.dist }));

    const eventsTwo = await Event.find({
      date: {
        $gte: startOfDay(formattedDate),
        $lte: endOfDay(formattedDate)
      },
      venue_id: { $in: venueData.map((venue) => venue._id) }
    })
      .populate('venue_id')
      .exec();

    eventsTwo.forEach((event) => {
      const venueDistData = venueData.find((venue) => venue._id.equals(event.venue_id._id));
      if (venueDistData) {
        event.venue_id.dist = venueDistData.dist;
      }
    });

    const newEvents = eventsTwo.sort((a, b) => a.venue_id.dist.calculated - b.venue_id.dist.calculated);
    const eventsTodaySortedByClosestTwo = [];

    newEvents.forEach((event) => {
      console.log('venue_id:', event.venue_id.name);
      console.log('venue_id.dist:', event.venue_id.dist);
      console.log('event_name:', event.eventName);

      const pushedObj = {
        eventResult: event,
        dist: event.venue_id.dist
      };
      eventsTodaySortedByClosestTwo.push(pushedObj);
    });

    const amountOfResults = eventsTodaySortedByClosestTwo.length;
    logger.info(`Amount of results: ${amountOfResults}`);
    const maxPages = Math.floor(amountOfResults / RESULTS_PER_PAGE);
    logger.info(`Max pages: ${maxPages}`);

    const startPage = Math.min(pageNumber * RESULTS_PER_PAGE, amountOfResults);
    const pageNumberLimit = startPage + RESULTS_PER_PAGE;
    logger.info(`Result number at start of current page: ${startPage}`);
    logger.info(`Page number limit: ${pageNumberLimit}`);
    logger.info(`Current page number: ${pageNumber}`);

    const result = {
      requestedEvents: eventsTodaySortedByClosestTwo.slice(startPage, pageNumberLimit),
      amountOfResults
    };
    logger.info(result.requestedEvents.map((item) => item.eventResult.eventName));

    return result;
  } catch (error) {
    logger.error(`Error: ${error.message}, Stack: ${error.stack}`);
    return null;
  }
}

export default getNearestEvents;
