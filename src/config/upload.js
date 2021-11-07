const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const AWS = require('aws-sdk');
const { basicResponse } = require('./response');
require('dotenv').config();

const s3 = new AWS.S3({
  //AWS SDK 설정 항목
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ID,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    //multerS3 설정 항목
    s3: s3,
    bucket: 'paramdandelion', //bucket 이름
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read', //읽고 쓰기 모두 허용
    key: function (req, file, cb) {
      let extension = path.extname(file.originalname);
      const destination = req.params.destination;
      if (!destination) cb('이미지가 저장될 폴더가 누락되었습니다.', null);
      cb(null, destination + '/' + Date.now().toString() + extension);
    },
  }),
});

module.exports = {
  upload,
  s3,
};
