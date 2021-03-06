const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const Post = require('../../models/Post');
const Like = require('../../models/Like');
const {
  checkNotExist,
  checkPost,
  checkPostNotExist,
  checkUserExist,
  checkLikeExist,
  checkPositionType,
} = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');
const mongoose = require('mongoose');

const post = {
  create: async (req, res) => {
    const userId = req.decoded._id;
    const dandelionId = req.params.dandelionId;
    const { title, text, location, images } = req.body;

    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    if (!location) return res.json(BasicResponse('위치 정보가 누락되었습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    const positionMessage = await checkPositionType(location.longitude, location.latitude);
    if (positionMessage) return res.json(basicResponse(positionMessage));

    //게시글 location validation

    const newPost = new Post({
      _user: userId,
      _dandelion: dandelionId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      createdAt: getKoreanTime(),
      title,
      text,
      images: images,
    });
    newPost
      .save()
      .then((result) => res.json(resultResponse('게시글을 작성하였습니다.', true, { data: result })))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('게시글 작성 중 에러가 발생하였습니다.'));
      });
  },
  delete: async (req, res) => {
    const userId = req.decoded._id;
    const dandelionId = req.params.dandelionId;
    const postId = req.params.postId;

    if (!mongoose.isValidObjectId(postId)) return res.json(basicResponse('게시글의 Object Id가 올바르지 않습니다.'));
    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    const checkPostMessage = await checkPost(dandelionId, userId, postId);
    if (checkPostMessage) return res.json(basicResponse(checkPostMessage));

    Post.deleteOne({ _id: postId, _dandelion: dandelionId })
      .then(res.json(basicResponse('게시글을 삭제하였습니다.', true)))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('게시글 삭제 중 에러가 발생하였습니다.'));
      });
  },
  get: async (req, res) => {
    // 사용자 게시글 불러오기 권한 validation 확인
    const userId = req.decoded._id;
    //사용자 id 확인
    const dandelionId = req.params.dandelionId;
    const page = parseInt(req.query.page);
    const maxPost = parseInt(req.query.maxPost);
    const hidePost = page === 1 ? 0 : (page - 1) * maxPost;

    if (!page || !maxPost) return res.json(basicResponse('페이지와 관련된 query parameter가 누락되었습니다.'));

    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    Post.aggregate([
      { $match: { _dandelion: mongoose.Types.ObjectId(dandelionId) } },
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
        return res.json(resultResponse('민들레에 해당하는 게시글입니다.', true, { data: result }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('게시글 가져오는 중 에러가 발생하였습니다.'));
      });
  },
  update: async (req, res) => {
    const userId = req.decoded._id;
    const dandelionId = req.params.dandelionId;
    const postId = req.params.postId;
    const changedText = req.body.text;
    const changedTitle = req.body.title;
    const images = req.body.images;

    if (!mongoose.isValidObjectId(postId)) return res.json(basicResponse('게시글의 Object Id가 올바르지 않습니다.'));
    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.'));

    const checkPostMessage = await checkPost(dandelionId, userId, postId);
    if (checkPostMessage) return res.json(basicResponse(checkPostMessage));

    //게시글 location validation
    if (!images) images = [];

    Post.updateOne(
      { _id: postId, _dandelion: dandelionId },
      { text: changedText, title: changedTitle, updatedAt: getKoreanTime(), images: images },
    )
      .then(res.json(basicResponse('게시글이 수정되었습니다.', true)))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('게시글 수정 중 에러가 발생하였습니다.'));
      });
  },
  like: async (req, res) => {
    const userId = req.decoded._id;
    const dandelionId = req.params.dandelionId;
    const postId = req.params.postId;

    const isUserExist = await checkUserExist(userId);
    if (!isUserExist) return res.json(basicResponse('존재하지 않는 사용자입니다.'));

    if (!mongoose.isValidObjectId(postId)) return res.json(basicResponse('게시글의 Object Id가 올바르지 않습니다.'));
    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.'));

    const isPostNotExist = await checkPostNotExist(postId);
    if (isPostNotExist) return res.json(basicResponse('해당 게시글이 존재하지 않습니다.'));

    const isLikeExist = await checkLikeExist(userId, postId);
    if (isLikeExist) {
      Like.deleteOne({ _user: userId, _post: postId })
        .then(res.json(resultResponse('좋아요를 취소했습니다.', true, { data: { currentLikeStatus: false } })))
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('좋아요 취소 중 에러가 발생하였습니다.'));
        });
    } else {
      const newLike = new Like({
        _user: userId,
        _post: postId,
      });
      newLike
        .save()
        .then((result) =>
          res.json(resultResponse('좋아요를 완료하였습니다.', true, { data: { currentLikeStatus: true } })),
        )
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('좋아요 생성 중 에러가 발생하였습니다.'));
        });
    }
  },
  getDetail: async (req, res) => {
    const userId = req.decoded._id;
    const dandelionId = req.params.dandelionId;
    const postId = req.params.postId;

    const isUserExist = await checkUserExist(userId);
    if (!isUserExist) return res.json(basicResponse('존재하지 않는 사용자입니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.'));

    const isPostNotExist = await checkPostNotExist(postId);
    if (isPostNotExist) return res.json(basicResponse('해당 게시글이 존재하지 않습니다.'));

    Post.aggregate([
      { $match: { _dandelion: mongoose.Types.ObjectId(dandelionId), _id: mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: 'users',
          localField: '_user',
          foreignField: '_id',
          as: '_user',
        },
      },
      { $unwind: '$_user' },
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
        return res.json(resultResponse('게시글 상세 정보입니다.', true, { data: result[0] }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('게시글 가져오는 중 에러가 발생하였습니다.'));
      });
  },
};

module.exports = post;
