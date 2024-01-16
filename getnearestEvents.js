import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Venue from './venueModel.js';
import Event from './eventModel.js';
import Artist from './artistModel.js';
import logger from './logger.js';

const RESULTS_PER_PAGE = 10;

async function getNearestEvents({ long, lat, date, pageNumber = 0 }) {
  try {
    const theDate = new Date(date);
    logger.info(`Received request for ${long} ${lat}, ${theDate}, ${pageNumber}`);

    const formattedDate = typeof theDate === 'string' ? parseISO(theDate) : theDate;
    logger.info(`Formatted date: ${formattedDate}`);
    logger.info(`Start of day: ${startOfDay(formattedDate)}, end of day: ${endOfDay(formattedDate)}`);

    const eventResults = await Event.find({
      date: {
        $gte: startOfDay(formattedDate),
        $lte: endOfDay(formattedDate)
      }
    }).populate('venue_id');

    const venueResults = await Venue.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(long), parseFloat(lat)] },
          key: 'location',
          distanceField: 'dist.calculated'
        }
      }
    ]);

    const eventsTodaySortedByClosest = venueResults.flatMap((venueResult) => {
      const venueDocument = venueResult.name || null;
      return eventResults
        .filter((eventResult) => {
          const eventDocument = eventResult.venue_id?.name || null;
          return venueDocument !== null && eventDocument !== null && eventDocument === venueDocument;
        })
        .map((eventResult) => ({
          eventResult,
          dist: venueResult.dist
        }));
    });

    const amountOfResults = eventsTodaySortedByClosest.length;
    logger.info(`Amount of results: ${amountOfResults}`);
    const maxPages = Math.floor(amountOfResults / RESULTS_PER_PAGE);
    logger.info(`Max pages: ${maxPages}`);

    const startPage = Math.min(pageNumber * RESULTS_PER_PAGE, amountOfResults);
    const pageNumberLimit = startPage + RESULTS_PER_PAGE;
    logger.info(`Result number at start of current page: ${startPage}`);
    logger.info(`Page number limit: ${pageNumberLimit}`);
    logger.info(`Current page number: ${pageNumber}`);

    const result = {
      requestedEvents: eventsTodaySortedByClosest.slice(startPage, pageNumberLimit),
      amountOfResults
    };
    logger.info(result.requestedEvents.map((item) => item.eventResult.eventName));

    return result;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export default getNearestEvents;
