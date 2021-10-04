const mongoose = require('mongoose');
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
  _parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dandelion',
  },
  _child: {
    type: mongoose.Schema.Types.ObjectId,
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
  level: {
    type: Number,
    default: 1,
  },
  address: String,
  description: String,
});
DandelionSchema.index({ location: '2dsphere' });
const Dandelion = mongoose.model('Dandelion', DandelionSchema);

module.exports = Dandelion;
