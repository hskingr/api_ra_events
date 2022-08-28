import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Venue from './venueModel.js';
import Event from './eventModel.js';
import Artist from './artistModel.js';

async function getNearestEvents({ long, lat, theDate = new Date(), pageNumber = 0 }) {
  try {
    console.log(`received request for ${long} ${lat}, ${theDate}, ${pageNumber}`);
    // converts the date to be readable by date-fns if it is a string
    const formattedDate = typeof theDate === 'string' ? parseISO(theDate) : theDate;
    console.log(`formatteddate: ${formattedDate}`);
    console.log(`startofday ${startOfDay(formattedDate)}, end of day ${endOfDay(formattedDate)}`);
    const eventResults = await Event.find({
      date: {
        $gte: startOfDay(formattedDate),
        $lte: endOfDay(formattedDate)
      }
    })
      .populate({
        path: 'linkedArtists',
        populate: {
          path: 'artist_id'
        }
      })
      .populate({
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
    console.log(`amount of results ${amountOfResults}`);
    const maxPages = Math.floor(amountOfResults / 10);
    console.log(`maxPages ${maxPages}`);
    let startPage;
    if (pageNumber === 0) {
      startPage = 0;
    } else {
      startPage = pageNumber * 10;
    }
    const pageNumberLimit = pageNumber * 10 + 10;
    // if there less than 10 more result left, then only return what is left
    if (startPage + 10 > amountOfResults) {
      startPage = amountOfResults;
    } else {
      startPage = pageNumber * 10 + 10;
    }
    console.log(`result number at start of current page: ${startPage}`);
    console.log(`page number limit: ${pageNumberLimit}`);
    console.log(`current page number: ${pageNumber}`);
    // if (pageNumber > maxPages) {
    //   pageNumber = amountOfResults;
    // }
    const result = {
      requestedEvents: eventsTodaySortedByClosest.slice(pageNumber, pageNumberLimit),
      amountOfResults: eventsTodaySortedByClosest.length
    };
    // console.log(result);
    console.log(result.requestedEvents.map((item) => `${item.eventResult.eventName}`));
    // const test = eventsTodaySortedByClosest.slice(pageNumber, pageNumberLimit);
    // console.log(test.map((item) => `${item.eventResult.eventName}`));
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default getNearestEvents;
