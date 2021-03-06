const mongoose = require('mongoose');
const { getKoreanTime } = require('../routes/provider/util');
const Schema = mongoose.Schema;
require('dotenv').config();
const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  type: {
    type: Number,
    default: 0,
  },
  thumbnail: {
    type: String,
    default: process.env.DEFAULT_PROFILE,
  },
  seeds: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: getKoreanTime(),
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
