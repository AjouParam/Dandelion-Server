const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const Comment = require('../../models/Comment');
const { checkPostNotExist, checkComment } = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');
const mongoose = require('mongoose');

const comment = {
  create: async (req, res) => {
    const userId = req.decoded._id;
    const postId = req.params.postId;
    const text = req.body.text;
    const location = req.body.location; // 사용자 게시글 작성 권한 validation 확인

    if (!mongoose.isValidObjectId(postId)) return res.json(basicResponse('게시글의 Object Id가 올바르지 않습니다.'));

    const isPostNotExist = await checkPostNotExist(postId);
    if (isPostNotExist) return res.json(basicResponse(isPostNotExist));

    const newComment = new Comment({
      _user: userId,
      _post: postId,
      text: text,
      createdAt: await getKoreanTime(),
    });
    newComment
      .save()
      .then((result) => res.json(resultResponse('댓글을 작성하였습니다.', true, { data: result })))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('댓글 작성 중 에러가 발생하였습니다.'));
      });
  },
  delete: async (req, res) => {
    const userId = req.decoded._id;
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    if (!mongoose.isValidObjectId(postId)) return res.json(basicResponse('게시글의 Object Id가 올바르지 않습니다.'));
    if (!mongoose.isValidObjectId(commentId)) return res.json(basicResponse('덧글의 Object Id가 올바르지 않습니다.'));

    const isPostNotExist = await checkPostNotExist(postId);
    if (isPostNotExist) return res.json(basicResponse(isPostNotExist));

    const checkCommentMessage = await checkPostComment(postId, userId, commentId);
    if (checkCommentMessage) return res.json(basicResponse(checkCommentMessage));

    Comment.deleteOne({ _id: commentId, _post: postId })
      .then(res.json(basicResponse('덧글을 삭제하였습니다.', true)))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('덧글 삭제 중 에러가 발생하였습니다.'));
      });
  },
  get: async (req, res) => {},
  update: async (req, res) => {},

  nested: {
    create: async (req, res) => {},
    delete: async (req, res) => {},
    get: async (req, res) => {},
    update: async (req, res) => {},
  },
};
module.exports = comment;
