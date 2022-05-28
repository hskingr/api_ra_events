import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ArtistSchema = new Schema({
  _id: String,
  realName: String,
  artistName: String,
  aliases: Array,
  location: Array,
  links: Array,
  url: String
});

const Artist = model('Artist', ArtistSchema);

export default Artist;
