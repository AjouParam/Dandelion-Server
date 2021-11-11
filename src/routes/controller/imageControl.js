const { resultResponse, basicResponse } = require('../../config/response');
const Post = require('../../models/Post');
const User = require('../../models/User');
const { checkPostNotExist, checkUserExist } = require('./Validation/Dandelion');
const { getKoreanTime } = require('../provider/util');
const { s3 } = require('../../config/upload');

const getUploadedInfo = (files) => {
  let fileList = [];
  let urlList = [];
  for (let object of files) {
    let file = {
      fileName: object.key,
      fileUrl: object.location,
    };
    fileList.push(file);
    urlList.push(file.fileUrl);
  }
  return { fileList, urlList };
};

const deleteImages = (Objects) => {
  try {
    params = {
      Bucket: 'paramdandelion',
      Delete: {
        Objects: Objects,
        Quiet: false,
      },
    };
    s3.deleteObjects(params, (err, data) => {
      if (err) {
        console.log(err);
        throw 'delete error';
      }
    });
  } catch (error) {
    throw error;
  }
};

const uploadImages = {
  toPost: async (req, res) => {
    const destination = req.params.destination;
    const postId = req.body.postId;
    const userId = req.decoded._id;
    const files = req.files;

    if (!files || files == undefined) return res.json(basicResponse('파일이 누락되었습니다.'));

    try {
      const isUserExist = await checkUserExist(userId);
      if (!isUserExist) throw '존재하지 않는 사용자입니다.';

      if (!destination || destination != 'post') throw '이미지 저장 폴더 이름이 누락되거나 잘못된 이름입니다.';

      const isPostNotExist = await checkPostNotExist(postId);
      if (isPostNotExist) throw '해당 게시글이 존재하지 않습니다.';

      let { fileList, urlList } = getUploadedInfo(files);

      if (fileList.length > 10 || urlList.length > 10) throw '게시글 최대 사진 수는 10장 이내입니다.';

      await Post.findById(postId)
        .select('images')
        .then((result) => {
          if (result.images.length) {
            //해당 게시글의 기존 사진들 s3에서 삭제
            let files = [];
            for (let i = 0; i < result.images.length; i++) {
              let key = result.images[i].split('.com/')[1];
              files.push({ Key: key });
            }
            deleteImages(files);
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('기존 게시글 이미지 삭제 중 에러가 발생하였습니다.'));
        });
      await Post.updateOne({ _id: postId }, { images: urlList })
        .then()
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('게시글 이미지 링크 업데이트 중 에러가 발생하였습니다.'));
        });

      return res.json(resultResponse('이미지를 성공적으로 저장했습니다.', true, { data: fileList }));
    } catch (error) {
      let Objects = [];
      for (let object of files) {
        let Object = {
          Key: object.key,
        };
        Objects.push(Object);
      }
      deleteImages(Objects);
      console.log(error);
      return res.json(basicResponse('게시글 이미지 링크 업데이트 중 에러가 발생하였습니다.\nerror:' + error));
    }
  },
  toThumbnail: async (req, res) => {
    const destination = req.params.destination;
    const userId = req.decoded._id;
    const files = req.files;

    if (!files || files == undefined) return res.json(basicResponse('파일이 누락되었습니다.'));

    try {
      const isUserExist = await checkUserExist(userId);
      if (!isUserExist) throw '존재하지 않는 사용자입니다.';

      if (!destination || destination != 'thumbnail') throw '이미지 저장 폴더 이름이 누락되거나 잘못된 이름입니다.';

      let { fileList, urlList } = getUploadedInfo(files);
      if (fileList.length > 1 || urlList.length > 1) throw '사용자 프로필은 한개의 사진만 등록될 수 있습니다.';
      let [imageUrl] = urlList;

      //기본 이미지 링크 저장해둬야.
      await User.findById(userId)
        .select('thumbnail')
        .then((result) => {
          if (result.thumbnail) {
            //유저 이미지가 잇고 그게 기본 이미지 프로필이 아니라면,
            const key = result.thumbnail.split('.com/')[1];
            deleteImages([{ Key: key }]);
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('기존 사용자 이미지 프로필 삭제 중 에러가 발생하였습니다.'));
        });

      await User.updateOne({ _id: userId }, { thumbnail: imageUrl })
        .then()
        .catch((err) => {
          console.log(err);
          return res.json(basicResponse('사용자 이미지 업데이트 중 에러가 발생하였습니다.'));
        });

      return res.json(resultResponse('사용자 이미지를 성공적으로 저장했습니다.', true, { data: fileList }));
    } catch (error) {
      let Objects = [];
      for (let object of files) {
        let Object = {
          Key: object.key,
        };
        Objects.push(Object);
      }
      deleteImages(Objects);
      console.log(error);
      return res.json(basicResponse('사용자 이미지 링크 업데이트 중 에러가 발생하였습니다.\nerror:' + error));
    }
  },
};

module.exports = uploadImages;
