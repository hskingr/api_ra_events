import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const pointSchema = new Schema({
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

const VenueSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  address: String,
  links: Array,
  url: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

const Venue = model('Venue', VenueSchema);

export default Venue;
