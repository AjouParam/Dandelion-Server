const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const EventSchema = new Schema({
  eventId: String,
  userId: {
    type: String,
    ref: 'User',
  },
  dandelionId: {
    type: String,
    ref: 'Dandelion',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
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
  FirstServedNum: {
    type: Number,
  },
  EventReward: {
    type: String,
  },
  EventStatus: {
    type: Boolean,
    default: 1,
  },
  like: {
    type: Number,
    default: 1,
  },
  comments: {
    type: Object,
  },
});
EventSchema.index({ location: '2dsphere' });
const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
