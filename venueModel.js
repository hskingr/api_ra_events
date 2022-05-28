import mongoose from "mongoose";

const { Schema, model } = mongoose;

const VenueSchema = new Schema({
  _id: String,
  name: String,
  address: String,
  links: Array,
  url: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

const Venue = model("Venue", VenueSchema);

export default Venue;
