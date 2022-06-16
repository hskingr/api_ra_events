import Venue from './venueModel.js';

async function queryTopTen(data) {
  try {
    const result = await Venue.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(data.long), parseFloat(data.lat)] },
          key: 'location',
          distanceField: 'dist.calculated'
        }
      }
      // { $limit: 5 }
    ]);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default queryTopTen;
