const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const Post = require('../../models/Post');
const PostComment = require('../../models/PostComment');
const PostLike = require('../../models/PostLike');
const { checkNotExist, checkPost } = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');
const mongoose = require('mongoose');

const post = {
  create: async (req, res) => {
    const userId = req.decoded._id;
    const dandelionId = req.params.dandelionId;
    const { title, text, location, images } = req.body;

    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    //게시글 location validation

    const newPost = new Post({
      _user: userId,
      _dandelion: dandelionId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      title,
      text,
      images: images,
      createdAt: await getKoreanTime(),
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
    const dandelionId = req.params.dandelionId;

    if (!mongoose.isValidObjectId(dandelionId))
      return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    const isDandelionNotExist = await checkNotExist(dandelionId);
    if (isDandelionNotExist) return res.json(basicResponse('해당 민들레가 존재하지 않습니다.', false));

    Post.find({ _dandelion: dandelionId })
      .populate({ path: '_user', select: 'name thumbnail' })
      .select('_id location createdAt updatedAt title text images _dandelion _user ')
      .then((result) => {
        let response = [];
        for (let i = 0; i < result.length; i++) {
          let resObj = {};
          let comments = await PostComment.count({ _post: result[i]._id });
          let likes = await PostLike.count({ _post: result[i]._id });
          resObj._id = result[i]._id;
          resObj.location = {};
          resObj.location.longitude = result[i].location.coordinates[0];
          resObj.location.latitude = result[i].location.coordinates[1];
          resObj.createdAt = result[i].createdAt;
          resObj.updatedAt = result[i].updatedAt;
          resObj._dandelion = result[i]._dandelion;
          resObj._user = result[i]._user;
          resObj.title = result[i].title;
          resObj.text = result[i].text;
          resObj.images = result[i].images;
          resObj.comments = comments;
          resObj.likes = likes;
          response.push(resObj);
          resObj = null;
        }
        res.json(resultResponse('민들레에 해당하는 게시글입니다.', true, { data: response }));
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

    Post.updateOne(
      { _id: postId, _dandelion: dandelionId },
      { text: changedText, title: changedTitle, updatedAt: await getKoreanTime(), images: images },
    )
      .then(res.json(basicResponse('게시글이 수정되었습니다.', true)))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('게시글 수정 중 에러가 발생하였습니다.'));
      });
  },

  comment: {
    create: async (req, res) => {},
    delete: async (req, res) => {},
    get: async (req, res) => {},
    update: async (req, res) => {},
  },
  nestedComment: {
    create: async (req, res) => {},
    delete: async (req, res) => {},
    get: async (req, res) => {},
    update: async (req, res) => {},
  },
};

module.exports = post;
