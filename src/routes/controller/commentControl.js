const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const Comment = require('../../models/Comment');
const { checkPostNotExist, checkComment, checkCommentNotExist } = require('./Validation/Dandelion');
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
  get: async (req, res) => {
    const postId = req.params.postId;
    const location = req.body.location; // 사용자 덧글 불러오기 권한 validation 확인
    const page = parseInt(req.query.page);
    const maxPost = parseInt(req.query.maxPost);
    const hidePost = page === 1 ? 0 : (page - 1) * maxPost;

    if (!page || !maxPost) return res.json(basicResponse('페이지와 관련된 query parameter가 누락되었습니다.'));

    if (!mongoose.isValidObjectId(postId)) return res.json(basicResponse('민들레의 Object Id가 올바르지 않습니다.'));

    const isPostNotExist = await checkPostNotExist(postId);
    if (isPostNotExist) return res.json(basicResponse('해당 게시글이 존재하지 않습니다.', false));

    Comment.aggregate([
      { $match: { _post: mongoose.Types.ObjectId(postId) } },
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
        $project: {
          createdAt: 1,
          updatedAt: 1,
          title: 1,
          text: 1,
          _post: 1,
          '_user._id': 1,
          '_user.name': 1,
          '_user.thumbnail': 1,
          depth: 1,
        },
      },
    ])
      .then((result) => {
        return res.json(resultResponse('게시글에 해당하는 댓글입니다.', true, { data: result }));
      })
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('댓글을 가져오는 중 에러가 발생하였습니다.'));
      });
  },
  update: async (req, res) => {
    const userId = req.decoded._id;
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const changedText = req.body.text;
    const location = req.body.location; // 사용자 덧글 불러오기 권한 validation 확인

    if (!mongoose.isValidObjectId(commentId)) return res.json(basicResponse('덧글의 Object Id가 올바르지 않습니다.'));
    if (!mongoose.isValidObjectId(postId)) return res.json(basicResponse('게시글의 Object Id가 올바르지 않습니다.'));

    const isPostNotExist = await checkPostNotExist(postId);
    if (isPostNotExist) return res.json(basicResponse('해당 게시글이 존재하지 않습니다.'));

    const checkCommentMessage = await checkComment(postId, userId, commentId);
    if (checkCommentMessage) return res.json(basicResponse(checkCommentMessage));

    //덧글 location validation

    Comment.updateOne({ _id: commentId, _post: postId }, { text: changedText, updatedAt: await getKoreanTime() })
      .then(res.json(basicResponse('덧글이 수정되었습니다.', true)))
      .catch((err) => {
        console.log(err);
        return res.json(basicResponse('덧글 수정 중 에러가 발생하였습니다.'));
      });
  },

  nested: {
    create: async (req, res) => {
      const userId = req.decoded._id;
      const parentCommentId = req.params.parentCommentId;
      const text = req.body.text;
      const location = req.body.location; // 사용자 게시글 작성 권한 validation 확인

      if (!mongoose.isValidObjectId(parentCommentId))
        return res.json(basicResponse('게시글의 Object Id가 올바르지 않습니다.'));

      //refactoring necessary
      const isCommentNotExist = await checkCommentNotExist(parentCommentId);
      if (isCommentNotExist) return res.json(basicResponse('해당 덧글이 존재하지 않습니다.'));

      const parentComment = await Comment.findById(parentCommentId, 'depth _post');

      const newComment = new Comment({
        _post: parentComment._post,
        _user: userId,
        _parentComment: parentCommentId,
        text: text,
        createdAt: await getKoreanTime(),
        depth: parentComment.depth + 1,
      });
      newComment
        .save()
        .then((result) => res.json(resultResponse('답글을 작성하였습니다.', true, { data: result })))
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('답글 작성 중 에러가 발생하였습니다.'));
        });
    },
    delete: async (req, res) => {},
    get: async (req, res) => {},
    update: async (req, res) => {},
  },
};
module.exports = comment;
