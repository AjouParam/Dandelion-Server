const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const EventSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  _dandelion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dandelion',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  firstComeNum: {
    type: Number,
    required: true,
  },
  rewards: {
    type: String,
  },
  status: {
    type: Number,
    default: 0,
  },
  text: {
    type: String,
    required: true,
  },
  images: [String],
  startDate: {
    type: Date,
    required: true,
  },
});
EventSchema.index({ location: '2dsphere' });
const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
