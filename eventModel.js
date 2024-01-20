import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const EventSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    eventName: String,
    venue: String,
    // venue_id: {
    //   type: Schema.Types.String,
    //   ref: "Venue",
    // },
    venue_id: { type: Schema.Types.ObjectId, ref: 'Venue' },
    address: String,
    date: Date,
    lineup: String,
    // linkedArtists: [
    //   {
    //     artist_id: {
    //       type: Schema.Types.String,
    //       ref: "Artist",
    //     },
    //   },
    // ],
    timeStart: Date,
    timeEnd: Date,
    promotionalLinks: Array,
    url: String,
    eventURL: String,
    flyerImage: [
      {
        fileName: String,
        image: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Event = model('Event', EventSchema);

export default Event;
