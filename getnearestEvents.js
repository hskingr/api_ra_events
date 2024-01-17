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
    }).populate({
      path: 'venue_id'
    });
    const venueResults = await Venue.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(long), parseFloat(lat)] },
          key: 'location',
          distanceField: 'dist.calculated'
        }
      }
    ]);

    const eventsTodaySortedByClosest = [];

    for (let v = 0; v < venueResults.length; v += 1) {
      const venueDocument = typeof venueResults[v].name !== `undefined` ? venueResults[v].name : null;
      for (let e = 0; e < eventResults.length; e += 1) {
        const eventDocument = typeof eventResults[e].venue_id !== `undefined` ? eventResults[e].venue_id.name : null;
        if (venueDocument !== null && eventDocument !== null && eventDocument === venueDocument) {
          const pushedObj = {
            eventResult: eventResults[e],
            dist: venueResults[v].dist
          };
          // console.log(pushedObj.eventResult.venue, pushedObj.eventResult.eventName, pushedObj.eventResult.date, pushedObj.dist);
          eventsTodaySortedByClosest.push(pushedObj);
        }
      }
    }

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
    logger.error(`Error: ${error.message}, Stack: ${error.stack}`);
    return null;
  }
}

export default getNearestEvents;
