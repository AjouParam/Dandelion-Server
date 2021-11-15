const mongoose = require('mongoose');
const { getKoreanTime } = require('../routes/provider/util');
const Schema = mongoose.Schema;

const VisitHistorySchema = Schema({
  _dandelion: {
    type: Schema.Types.ObjectId,
    ref: 'Dandelion',
    required: true,
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: getKoreanTime(),
  },
});

const VisitHistory = mongoose.model('VisitHistory', VisitHistorySchema);

module.exports = VisitHistory;
