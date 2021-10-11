const mongoose = require('mongoose');
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
});

const PostLike = mongoose.model('PostLike', LikeSchema);

module.exports = PostLike;
