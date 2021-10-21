const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { getKoreanTime } = require('../routes/provider/util');
const CommentSchema = Schema({
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
  _parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  text: {
    type: String,
    required: true,
  },
  depth: {
    type: Number,
    default: 1,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: getKoreanTime(),
  },
  updatedAt: {
    type: Date,
    default: getKoreanTime(),
  },
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
