const mongoose = require('mongoose');
const { getKoreanTime } = require('../routes/provider/util');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const curr = new Date();
//한국 시간으로 저장되어야함
const DandelionSchema = new Schema({
  name: String,
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: getKoreanTime(),
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
  level: {
    type: Number,
    default: 1,
  },
  address: String,
  description: String,
  cumulativeVisitors: {
    type: Number,
    default: 0,
  },
  realTimeVisitors: {
    type: Number,
    default: 0,
  },
});
DandelionSchema.index({ location: '2dsphere' });
const Dandelion = mongoose.model('Dandelion', DandelionSchema);

module.exports = Dandelion;
