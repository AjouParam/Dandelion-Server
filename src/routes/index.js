'use strict';

const express = require('express');
const { upload } = require('../config/upload');
const router = express.Router();

const mail = require('./controller/mailControl');
const account = require('./controller/accountControl');
const dandelion = require('./controller/mainControl');
const post = require('./controller/postControl');
const event = require('./controller/eventControl');
const comment = require('./controller/commentControl');
const myPage = require('./controller/mypageControl');
const uploadImages = require('./controller/imageControl');
const verifyToken = require('./provider/verifyToken');

//account
//회원가입
router.post('/account/signUp', account.signUp);
//로그인
router.post('/account/signIn', account.signIn);
//비밀번호 재설정
router.post('/account/resetPwd', account.resetPwd);
//구글 로그인
router.post('/account/google', account.googleSignIn);
// router.post('/account/withdrawal', account.withDrawal);
//이메일 중복 확인
router.post('/account/checkEmail', account.checkEmail);
//닉네임 중복 확인
router.post('/account/checkName', account.checkName);
//이메일 인증
router.post('/account/emailAuth', account.sendEmail);
//토큰 재발행
router.get('/account/regenerateToken', verifyToken, account.regenerateToken);

//main
//민들레 생성
router.post('/dandelion/create', verifyToken, dandelion.create);
//좌표 범위 내의 민들레 불러오기
router.post('/dandelion/get', verifyToken, dandelion.get);
//민들레 클릭
router.post('/dandelion/getDetail/:dandelionId', verifyToken, dandelion.getDetail);

//누적 방문자수 디테일 : 지금은 중복 허용 상태임.
//민들레 방문
router.post('/dandelion/visit/:dandelionId', verifyToken, dandelion.visit);
//민들레 나감
router.get('/dandelion/exit/:dandelionId', verifyToken, dandelion.exit);
//내 주변 핫스팟
router.post('/dandelion/get/hotspot/local', verifyToken, dandelion.getLocalHotSpot);
//전국 핫스팟
router.post('/dandelion/get/hotspot/national', verifyToken, dandelion.getNationalHotSpot);

//민들레 상세
//민들레 게시글
router.post('/:dandelionId/post/create', verifyToken, post.create);
router.delete('/:dandelionId/post/delete/:postId', verifyToken, post.delete);
router.patch('/:dandelionId/post/update/:postId', verifyToken, post.update);
router.get('/:dandelionId/post/', verifyToken, post.get);

//민들레 게시글/이벤트 상세 조회
router.get('/:dandelionId/:postId/detail', verifyToken, post.getDetail);
//민들레 게시글/이벤트 좋아요
router.post('/:dandelionId/:postId/like', verifyToken, post.like);

//민들레 게시글-덧글
router.post('/:postId/comment/create', verifyToken, comment.create);
router.delete('/:postId/comment/delete/:commentId', verifyToken, comment.delete);
router.patch('/:postId/comment/update/:commentId', verifyToken, comment.update);
router.get('/:postId/comment/', verifyToken, comment.get);

//민들레 게시글-답글
router.post('/:parentCommentId/nestedComment/create', verifyToken, comment.nested.create);
router.delete('/:parentCommentId/nestedComment/delete/:commentId', verifyToken, comment.nested.delete);
router.patch('/:parentCommentId/nestedComment/update/:commentId', verifyToken, comment.nested.update);
router.get('/:parentCommentId/nestedComment/', verifyToken, comment.nested.get);

//민들레 이벤트
router.post('/:dandelionId/event/create', verifyToken, event.create);
router.delete('/:dandelionId/event/delete/:eventId', verifyToken, event.delete);
router.patch('/:dandelionId/event/update/:eventId', verifyToken, event.update);
router.get('/:dandelionId/event/', verifyToken, event.get);

//내가 쓴 글 조회
router.get('/dandelion/post/get/mine', verifyToken, myPage.getMyPost);
//내가 심은 민들레 조회
router.post('/dandelion/get/mine', verifyToken, myPage.getMyDandelion);
//게시글 이미지 업로드 api
router.post('/dandelion/images/:destination', verifyToken, upload.array('images', 10), uploadImages.toPost);

//사용자 프로필 업로드 api
router.post('/account/images/:destination', verifyToken, upload.array('images', 1), uploadImages.toThumbnail);
router.post('/mail/create', mail.create);
router.post('/mail/load', mail.load);
router.post('/mail/loadDetail', mail.loadDetail);
router.post('/mail/save', mail.save);
module.exports = router;
