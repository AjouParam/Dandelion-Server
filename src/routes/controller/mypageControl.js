const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const Post = require('../../models/Post');
const Like = require('../../models/Like');
const {
  checkNotExist,
  checkPost,
  checkPostNotExist,
  checkPostComment,
  checkUserExist,
  checkLikeExist,
} = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');
const mongoose = require('mongoose');

const myPage = {
  getMyPost: async (req, res) => {},
  getMyDandelion: async (req, res) => {},
};

module.exports = myPage;
