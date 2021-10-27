const mongoose = require('mongoose');
const { getKoreanTime } = require('../routes/provider/util');
const Schema = mongoose.Schema;

const LikeSchema = Schema({
  _post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
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

const PostLike = mongoose.model('Like', LikeSchema);

module.exports = PostLike;
