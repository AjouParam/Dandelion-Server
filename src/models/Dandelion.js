const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const locationSchema = new Schema({
  longitude: Number,
  latitude: Number,
});

const DandelionSchema = new Schema({
  name: String,
  _creator: {
    type: String,
    ref: 'User',
  },
  _parent: {
    type: String,
    ref: 'Dandelion',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  longitude: Number,
  latitude: Number,
  level: {
    type: Number,
    default: 1,
  },
  address: String,
  description: String,
});

const Dandelion = mongoose.model('Dandelion', DandelionSchema);

module.exports = Dandelion;
