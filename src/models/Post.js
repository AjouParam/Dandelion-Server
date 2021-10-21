const mongoose = require('mongoose');
const { getKoreanTime } = require('../routes/provider/util');
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
      default: getKoreanTime(),
    },
    updatedAt: {
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
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    images: [String],
    isEvent: {
      type: Boolean,
      default: false,
    },
    firstComeNum: {
      type: Number,
    },
    rewards: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
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
