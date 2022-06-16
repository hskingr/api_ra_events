import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Venue from './venueModel.js';
import Event from './eventModel.js';
import Artist from './artistModel.js';

async function getNearestEvents({ long, lat, date = new Date() }) {
  try {
    const eventResults = await Event.find({
      date: {
        $gte: startOfDay(parseISO(date)),
        $lte: endOfDay(parseISO(date))
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
    return eventsTodaySortedByClosest.slice(0, 10);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default getNearestEvents;
