const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = Schema({
  _post: {
    type: Schema.types.ObjectId,
    ref: 'Post',
    required: true,
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentComment: {
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
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
});

const Comment = mongoose.model('PostComment', CommentSchema);

module.exports = Comment;
