const Dandelion = require('../../models/Dandelion');
const { resultResponse, basicResponse } = require('../../config/response');
const Post = require('../../models/Post');
const User = require('../../models/User');
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

const uploadImages = {
  toPost: async (req, res) => {
    const postId = req.body.postId;
    const userId = req.decoded._id;

    const files = req.files;
    const { s3 } = require('../../config/upload');
    let fileList = [];
    let urlList = [];
    try {
      if (!files || files == undefined) return res.json(basicResponse('파일이 누락되었습니다.'));

      const isPostNotExist = await checkPostNotExist(postId);
      if (isPostNotExist) throw '해당 게시글이 존재하지 않습니다.';

      // 사용자 자체 validation 확인

      for (let object of files) {
        let file = {
          fileName: object.key,
          fileUrl: object.location,
        };
        fileList.push(file);
        urlList.push(file.fileUrl);
      }
      console.log(fileList);

      Post.updateOne({ _id: postId }, { images: urlList })
        .then(console.log('게시글 이미지가 업로드되었습니다.'))
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('게시글 이미지 업데이트 중 에러가 발생하였습니다.'));
        });

      return res.json(resultResponse('이미지를 성공적으로 저장했습니다.', true, { data: fileList }));
    } catch (error) {
      let params;
      let Objects = [];

      for (let object of files) {
        let Object = {
          Key: object.key,
        };
        Objects.push(Object);
      }
      params = {
        Bucket: 'paramdandelion',
        Delete: {
          Objects: Objects,
          Quiet: false,
        },
      };
      s3.deleteObjects(params, function (err, data) {
        if (err) logger.error(`S3 객체 삭제 중 에러가 발생하였습니다.\n: ${err}`);
      });
      console.log(error);
      return res.json(basicResponse('게시글 이미지 저장 중 에러가 발생하였습니다.'));
    }
  },
  toThumbnail: async (req, res) => {},
};

module.exports = uploadImages;
