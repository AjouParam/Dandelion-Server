const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;
const PostSchema = new Schema({
  postId: String,
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
  title: {
    type: String,
  },
  text: {
    type: String,
  },
  like: {
    type: Number,
    default: 1,
  },
  image: {
    type: String,
  },
  comments: {
    type: Object,
  },
});
PostSchema.index({ location: '2dsphere' });
const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
