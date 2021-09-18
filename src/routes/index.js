'use strict';

const express = require('express');
const router = express.Router();
const account = require('./controller/accountControl');
const dandelion = require('./controller/mainControl');
const verifyToken = require('./provider/verifyToken');
//test
const Dandelion = require('../models/Dandelion');

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

//민들레 성장, 실시간 방문자 수 부분

module.exports = router;
