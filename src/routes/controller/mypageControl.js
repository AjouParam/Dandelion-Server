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
  getMyPost: async (req, res) => {
    // 사용자 자체 validation 확인
    const userId = req.decoded._id;
    const page = parseInt(req.query.page);
    const maxPost = parseInt(req.query.maxPost);
    const hidePost = page === 1 ? 0 : (page - 1) * maxPost;

    if (!page || !maxPost) return res.json(basicResponse('페이지와 관련된 query parameter가 누락되었습니다.'));

    Post.aggregate([
      { $match: { _user: mongoose.Types.ObjectId(userId), isEvent: false } },
      {
        $lookup: {
          from: 'users',
          localField: '_user',
          foreignField: '_id',
          as: '_user',
        },
      },
      { $unwind: '$_user' },
      { $sort: { createdAt: -1 } },
      { $skip: hidePost },
      { $limit: maxPost },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: '_post',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: '_post',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'likes',
          as: 'userLike',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_post', '$$id'] }, { $eq: ['$_user', mongoose.Types.ObjectId(userId)] }],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          location: {
            longitude: { $arrayElemAt: ['$location.coordinates', 0] },
            latitude: { $arrayElemAt: ['$location.coordinates', 1] },
          },
          createdAt: 1,
          updatedAt: 1,
          title: 1,
          text: 1,
          images: 1,
          _dandelion: 1,
          '_user._id': 1,
          '_user.name': 1,
          '_user.thumbnail': 1,
          comments: { $size: '$comments' },
          likes: { $size: '$likes' },
          isEvent: 1,
          userLike: {
            $switch: {
              branches: [
                { case: { $gt: [{ $size: { $ifNull: ['$userLike', []] } }, 0] }, then: true },
                { case: { $lt: [{ $size: { $ifNull: ['$userLike', []] } }, 1] }, then: false },
              ],
              default: false,
            },
          },
        },
      },
    ])
      .then((result) => {
        return res.json(resultResponse('내가 작성한 게시글입니다.', true, { data: result }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('내가 작성한 게시글을 가져오는 중 에러가 발생하였습니다.'));
      });
  },
  getMyDandelion: async (req, res) => {
    // 사용자 자체 validation 확인
    const userId = req.decoded._id;
    const page = parseInt(req.query.page);
    const maxPost = parseInt(req.query.maxPost);
    const hidePost = page === 1 ? 0 : (page - 1) * maxPost;
    const currentPosition = req.body.currentPosition;

    if (!currentPosition) return res.json(basicResponse('Request Body에 정보가 누락되었습니다.'));

    if (!currentPosition.latitude || !currentPosition.longitude)
      return res.json(basicResponse('위치 정보가 누락되었습니다.'));

    if (!page || !maxPost) return res.json(basicResponse('페이지와 관련된 query parameter가 누락되었습니다.'));

    Dandelion.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [currentPosition.longitude, currentPosition.latitude] },
          spherical: true,
          distanceField: 'distance',
          distanceMuliplier: 0.001,
          query: { _creator: mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_creator',
          foreignField: '_id',
          as: '_creator',
        },
      },
      { $unwind: '$_creator' },
      { $sort: { createdAt: -1, distasnce: 1 } },
      { $skip: hidePost },
      { $limit: maxPost },
      {
        $lookup: {
          from: 'posts',
          as: 'events',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_dandelion', '$$id'] }, { $eq: ['$isEvent', true] }],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          location: {
            longitude: { $arrayElemAt: ['$location.coordinates', 0] },
            latitude: { $arrayElemAt: ['$location.coordinates', 1] },
          },
          createdAt: 1,
          description: 1,
          level: 1,
          distance: 1,
          cumulativeVisitors: 1,
          address: 1,
          '_creator._id': 1,
          '_creator.name': 1,
          '_creator.thumbnail': 1,
          events: { $size: '$events' },
          name: 1,
        },
      },
    ])
      .then((result) => {
        return res.json(resultResponse('내가 심은 민들레입니다.', true, { data: result }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('내가 심은 민들레를 가져오는 중 에러가 발생하였습니다.'));
      });
  },
};

module.exports = myPage;
