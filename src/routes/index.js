'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

//account
router.post('/account/signup', ctrl.account.signup);
router.post('/account/signin', ctrl.account.signin);
// router.post('/account/findPwd', ctrl.account.resetPwd);
// router.post('/account/withdrawal', ctrl.account.withDrawal);
//router.post("/login", ctrl.account.login);
//닉네임 중복 검사 필요
router.post('/account/checkEmail', ctrl.account.checkEmail);
router.post('/account/checkName', ctrl.account.checkName);
module.exports = router;
