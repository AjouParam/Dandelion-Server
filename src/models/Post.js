const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    _dandelion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dandelion',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
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
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    images: [String],
    comments: {
      type: Number,
      default: 0,
    },
  },
  //{ toObject: { virtuals: true }, toJSON: { virtuals: true } },
);
PostSchema.index({ location: '2dsphere' });
PostSchema.virtual('comment', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
