const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = Schema({
  _event: {
    type: Schema.types.ObjectId,
    ref: 'Event',
    required: true,
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Like = mongoose.model('EventLike', LikeSchema);

module.exports = Like;
