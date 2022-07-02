import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Venue from './venueModel.js';
import Event from './eventModel.js';
import Artist from './artistModel.js';

async function getNearestEvents({ long, lat, theDate = new Date(), pageNumber = 0 }) {
  try {
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
    let pageNumberLimit = pageNumber + 10;
    // if there less than 10 more result left, then only return what is left
    if (pageNumber + 10 > amountOfResults) {
      pageNumberLimit = amountOfResults;
    }
    const result = {
      requestedEvents: eventsTodaySortedByClosest.slice(pageNumber, pageNumberLimit),
      amountOfResults: eventsTodaySortedByClosest.length
    };
    // console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default getNearestEvents;
