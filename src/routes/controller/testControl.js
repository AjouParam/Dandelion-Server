const { resultResponse, basicResponse } = require('../../config/response');
const Post = require('../../models/Post');
const { getKoreanTime } = require('../provider/util');

const test = {
  get: async (req, res) => {
    res.json(resultResponse('시간은?', true, { time: await getKoreanTime() }));
  },
};

module.exports = test;
